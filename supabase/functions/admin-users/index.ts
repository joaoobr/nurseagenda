import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.2'
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Verify the calling user is admin
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const userId = user.id

    // Check admin role
    const { data: roleData } = await userClient.from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle()
    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Forbidden: admin role required' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Admin client with service role
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    switch (action) {
      case 'list': {
        const page = parseInt(url.searchParams.get('page') || '1')
        const perPage = 50
        const { data: { users }, error } = await adminClient.auth.admin.listUsers({ page, perPage })
        if (error) throw error

        // Get roles for all users
        const userIds = users.map(u => u.id)
        const { data: roles } = await adminClient.from('user_roles').select('user_id, role').in('user_id', userIds)

        // Get profiles
        const { data: profiles } = await adminClient.from('profiles').select('id, full_name, specialty').in('id', userIds)

        // Check Stripe subscriptions
        let subscriptionMap: Record<string, { subscribed: boolean; subscription_end: string | null }> = {}
        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
        if (stripeKey) {
          try {
            const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" })
            // Get all emails
            const emails = users.map(u => u.email).filter(Boolean)
            // Batch check: get all customers by email
            for (const u of users) {
              if (!u.email) {
                subscriptionMap[u.id] = { subscribed: false, subscription_end: null }
                continue
              }
              try {
                const customers = await stripe.customers.list({ email: u.email, limit: 1 })
                if (customers.data.length === 0) {
                  subscriptionMap[u.id] = { subscribed: false, subscription_end: null }
                  continue
                }
                const subs = await stripe.subscriptions.list({ customer: customers.data[0].id, status: 'active', limit: 1 })
                if (subs.data.length > 0) {
                  subscriptionMap[u.id] = {
                    subscribed: true,
                    subscription_end: new Date(subs.data[0].current_period_end * 1000).toISOString()
                  }
                } else {
                  subscriptionMap[u.id] = { subscribed: false, subscription_end: null }
                }
              } catch {
                subscriptionMap[u.id] = { subscribed: false, subscription_end: null }
              }
            }
          } catch (e) {
            console.error('Stripe check failed:', e)
          }
        }

        const enrichedUsers = users.map(u => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          banned: u.banned_until ? (new Date(u.banned_until) > new Date()) : false,
          banned_until: u.banned_until,
          full_name: profiles?.find(p => p.id === u.id)?.full_name || u.user_metadata?.full_name || '',
          specialty: profiles?.find(p => p.id === u.id)?.specialty || '',
          role: roles?.find(r => r.user_id === u.id)?.role || 'user',
          subscribed: subscriptionMap[u.id]?.subscribed || false,
          subscription_end: subscriptionMap[u.id]?.subscription_end || null,
        }))

        return new Response(JSON.stringify({ users: enrichedUsers }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'ban': {
        const body = await req.json()
        const targetUserId = body.user_id
        if (!targetUserId) return new Response(JSON.stringify({ error: 'user_id required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        if (targetUserId === userId) return new Response(JSON.stringify({ error: 'Cannot ban yourself' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

        const { error } = body.ban
          ? await adminClient.auth.admin.updateUserById(targetUserId, { ban_duration: '876000h' })
          : await adminClient.auth.admin.updateUserById(targetUserId, { ban_duration: 'none' })
        if (error) throw error

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      case 'delete': {
        const body = await req.json()
        const targetUserId = body.user_id
        if (!targetUserId) return new Response(JSON.stringify({ error: 'user_id required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        if (targetUserId === userId) return new Response(JSON.stringify({ error: 'Cannot delete yourself' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

        const { error } = await adminClient.auth.admin.deleteUser(targetUserId)
        if (error) throw error

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      case 'update_role': {
        const body = await req.json()
        const targetUserId = body.user_id
        const newRole = body.role
        if (!targetUserId || !newRole) return new Response(JSON.stringify({ error: 'user_id and role required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        if (targetUserId === userId) return new Response(JSON.stringify({ error: 'Cannot change your own role' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

        await adminClient.from('user_roles').delete().eq('user_id', targetUserId)
        const { error: insertError } = await adminClient.from('user_roles').insert({ user_id: targetUserId, role: newRole })
        if (insertError) throw insertError

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
  } catch (error) {
    console.error('Admin error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})