// Returns subscription/access info for the authenticated user (matched by email)
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData?.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const email = userData.user.email.toLowerCase();
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const { data, error } = await admin
      .from("hotmart_subscriptions")
      .select("status, expires_at, product_name, next_charge_date, purchase_date")
      .eq("email", email)
      .maybeSingle();

    if (error) throw error;

    const now = Date.now();
    const expiresAt = data?.expires_at ? new Date(data.expires_at).getTime() : null;
    const subscribed = !!data
      && data.status === "active"
      && (expiresAt === null || expiresAt > now);

    return new Response(JSON.stringify({
      subscribed,
      status: data?.status ?? null,
      expires_at: data?.expires_at ?? null,
      next_charge_date: data?.next_charge_date ?? null,
      purchase_date: data?.purchase_date ?? null,
      product_name: data?.product_name ?? null,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
