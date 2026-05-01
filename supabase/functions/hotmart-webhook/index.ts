// Hotmart Webhook receiver
// Public endpoint (no JWT). Validates HOTTOK header and upserts subscription rows.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-hotmart-hottok",
};

const log = (step: string, details?: unknown) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[HOTMART-WH] ${step}${d}`);
};

// Map Hotmart events → our subscription status
// Reference: https://developers.hotmart.com/docs/en/v1/webhook/about-webhook/
function mapStatus(event: string, currentStatus: string | null): string {
  const e = (event || "").toUpperCase();
  // Active states
  if ([
    "PURCHASE_APPROVED",
    "PURCHASE_COMPLETE",
    "PURCHASE_BILLET_PRINTED", // not active yet, but payment pending
    "SUBSCRIPTION_REACTIVATION",
    "SWITCH_PLAN",
  ].includes(e)) {
    if (e === "PURCHASE_BILLET_PRINTED") return currentStatus ?? "expired";
    return "active";
  }
  if (["PURCHASE_CANCELED", "SUBSCRIPTION_CANCELLATION"].includes(e)) return "canceled";
  if (["PURCHASE_REFUNDED", "PURCHASE_PROTEST"].includes(e)) return "refunded";
  if (e === "PURCHASE_CHARGEBACK") return "chargeback";
  if (["PURCHASE_DELAYED", "PURCHASE_EXPIRED"].includes(e)) return "expired";
  return currentStatus ?? "expired";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const expectedHottok = Deno.env.get("HOTMART_HOTTOK");
    if (!expectedHottok) throw new Error("HOTMART_HOTTOK is not set");

    // Hotmart sends HOTTOK either as a header (x-hotmart-hottok) or in the body.hottok
    const headerHottok = req.headers.get("x-hotmart-hottok") || req.headers.get("X-HOTMART-HOTTOK");
    const bodyText = await req.text();
    let body: any = {};
    try { body = JSON.parse(bodyText); } catch { body = {}; }

    const incomingHottok = headerHottok || body?.hottok || body?.data?.hottok;
    if (incomingHottok !== expectedHottok) {
      log("Invalid HOTTOK", { hasHeader: !!headerHottok });
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    // Hotmart payload variants — try multiple paths
    const event: string = body?.event || body?.data?.event || body?.type || "";
    const buyer = body?.data?.buyer || body?.buyer || {};
    const purchase = body?.data?.purchase || body?.purchase || {};
    const product = body?.data?.product || body?.product || {};
    const subscription = body?.data?.subscription || body?.subscription || {};

    const email: string | undefined = (buyer?.email || body?.email || "").toString().trim().toLowerCase();
    if (!email) {
      log("No buyer email in payload", { event });
      return new Response(JSON.stringify({ error: "Missing buyer email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const transactionId: string | null = purchase?.transaction || body?.data?.transaction || null;
    const productId: string | null = (product?.id ?? product?.ucode ?? null)?.toString() ?? null;
    const productName: string | null = product?.name ?? null;
    const subscriberCode: string | null = subscription?.subscriber?.code || subscription?.code || null;
    const purchaseDate = purchase?.approved_date || purchase?.order_date || null;
    const nextChargeDate = subscription?.date_next_charge || purchase?.date_next_charge || null;

    const purchaseDateIso = purchaseDate ? new Date(typeof purchaseDate === "number" ? purchaseDate : purchaseDate).toISOString() : null;
    const nextChargeIso = nextChargeDate ? new Date(typeof nextChargeDate === "number" ? nextChargeDate : nextChargeDate).toISOString() : null;

    // Read current row to compute next status correctly
    const { data: existing } = await supabase
      .from("hotmart_subscriptions")
      .select("status")
      .eq("email", email)
      .maybeSingle();

    const newStatus = mapStatus(event, existing?.status ?? null);

    // expires_at: when active, prefer next charge date; else null (open-ended). When not active, set to now.
    let expiresAt: string | null = null;
    if (newStatus === "active") {
      expiresAt = nextChargeIso; // null = no expiry yet
    } else {
      expiresAt = new Date().toISOString();
    }

    const row = {
      email,
      status: newStatus,
      transaction_id: transactionId,
      product_id: productId,
      product_name: productName,
      subscriber_code: subscriberCode,
      purchase_date: purchaseDateIso,
      next_charge_date: nextChargeIso,
      expires_at: expiresAt,
      last_event: event,
      raw_event: body,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("hotmart_subscriptions")
      .upsert(row, { onConflict: "email" });

    if (error) {
      log("Upsert error", { message: error.message });
      throw error;
    }

    log("Processed", { email, event, newStatus });
    return new Response(JSON.stringify({ ok: true, status: newStatus }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
