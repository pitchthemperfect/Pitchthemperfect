/**
 * Edge Function: handle-ziina-webhook
 * Receives Ziina webhook events (payment_intent.succeeded, payment_intent.failed, etc.)
 * Updates registration status in DB and sends confirmation email.
 * 
 * Deploy: supabase functions deploy handle-ziina-webhook
 * Webhook URL: https://<project>.supabase.co/functions/v1/handle-ziina-webhook
 * 
 * Register this URL in Ziina: POST /api/webhooks
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || ""
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""

serve(async (req) => {
  try {
    const payload = await req.json()

    // Ziina webhook format:
    // { event: "payment_intent.succeeded", data: { id, amount, status, ... } }
    const event = payload.event || payload.type
    const paymentIntent = payload.data || payload

    if (!paymentIntent?.id) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Find registration by ziina_payment_id or the message
    const { data: regs } = await supabase
      .from("registrations")
      .select("id, role, email, name")
      .or(`ziina_payment_id.eq.${paymentIntent.id},amount.ilike.%${paymentIntent.id}%`)
      .limit(1)

    if (!regs || regs.length === 0) {
      // Registration not found — still return 200 so Ziina doesn't retry
      return new Response(JSON.stringify({ message: "No matching registration" }), { status: 200 })
    }

    const reg = regs[0]

    // Map Ziina status to our status
    let newStatus = reg.role === "pitcher" ? "pitch" : "pending"
    if (event?.includes("succeeded") || paymentIntent.status === "succeeded") {
      newStatus = reg.role === "pitcher" ? "pitch" : "paid"
    } else if (event?.includes("failed") || paymentIntent.status === "failed") {
      newStatus = "failed"
    }

    // Update registration
    const { error: updateErr } = await supabase
      .from("registrations")
      .update({
        ziina_payment_id: paymentIntent.id,
        status: newStatus,
        amount: paymentIntent.amount
          ? `AED ${(paymentIntent.amount / 100).toFixed(2)}`
          : undefined,
      })
      .eq("id", reg.id)

    if (updateErr) {
      console.error("Update error:", updateErr)
      return new Response(JSON.stringify({ error: "Update failed" }), { status: 500 })
    }

    // If payment succeeded, trigger confirmation email
    if (newStatus === "paid" || newStatus === "pitch") {
      const cfUrl = `${SUPABASE_URL}/functions/v1/send-confirmation`
      fetch(cfUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
        body: JSON.stringify({ registration_id: reg.id, role: reg.role }),
      }).catch(() => {})
    }

    return new Response(JSON.stringify({ success: true, status: newStatus }), { status: 200 })
  } catch (err) {
    console.error("webhook error:", err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
