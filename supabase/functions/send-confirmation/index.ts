/**
 * Edge Function: send-confirmation
 * Trigger: called after payment is verified (Ziina webhook handler will call this)
 * Sends welcome/confirmation email via Brevo API.
 * 
 * Deploy: supabase functions deploy send-confirmation
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY") || ""
const BREVO_LIST_ID = parseInt(Deno.env.get("BREVO_LIST_ID") || "0")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || ""
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""

serve(async (req) => {
  try {
    const { registration_id, role } = await req.json()

    // Fetch registration details
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data: reg, error } = await supabase
      .from("registrations")
      .select("name, email, role")
      .eq("id", registration_id)
      .single()

    if (error || !reg) {
      return new Response(JSON.stringify({ error: "Registration not found" }), { status: 404 })
    }

    // Send confirmation email via Brevo
    const brevoPayload = {
      sender: { name: "Pitch Them Perfect", email: "hello@pitchthemperfect.com" },
      to: [{ email: reg.email, name: reg.name }],
      subject: role === "pitcher"
        ? "You're in the running! — Pitch Them Perfect"
        : "You're all set! — Pitch Them Perfect",
      htmlContent: role === "pitcher"
        ? `<h2>Hi ${reg.name},</h2><p>Your pitch nomination has been received! Our team will review every submission carefully. If selected, we'll be in touch with next steps and event details.</p><p>— Team Pitch Them Perfect</p>`
        : `<h2>Hi ${reg.name},</h2><p>Your spot is secured! Get ready for a night of real pitches, real people, and real connections. Event details, drink voucher info, and dress code will follow soon.</p><p>— Team Pitch Them Perfect</p>`,
      listIds: BREVO_LIST_ID ? [BREVO_LIST_ID] : undefined,
    }

    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(brevoPayload),
    })

    if (!brevoRes.ok) {
      const err = await brevoRes.text()
      console.error("Brevo error:", err)
      return new Response(JSON.stringify({ error: "Email send failed" }), { status: 500 })
    }

    // Mark email as sent
    await supabase.from("registrations").update({ email_sent: true }).eq("id", registration_id)

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (err) {
    console.error("send-confirmation error:", err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
