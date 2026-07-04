/**
 * Edge Function: send-confirmation
 * Trigger: called after payment is verified
 * Sends welcome/confirmation email via Brevo API.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY") || ""
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || ""
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""

function getBrevoListId() {
  const raw = Deno.env.get("BREVO_LIST_ID")
  if (!raw) return undefined
  const id = parseInt(raw)
  return !isNaN(id) && id > 0 ? id : undefined
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  }

  try {
    const { registration_id } = await req.json()

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data: reg, error } = await supabase
      .from("registrations")
      .select("name, email, role")
      .eq("id", registration_id)
      .single()

    if (error || !reg) {
      return new Response(JSON.stringify({ error: "Registration not found" }), {
        status: 404,
        headers: { "Access-Control-Allow-Origin": "*" },
      })
    }

    const isPitcher = reg.role === "pitcher"

    const payload = {
      sender: { name: "Pitch Them Perfect", email: "pitchthemperfect@gmail.com" },
      to: [{ email: reg.email, name: reg.name }],
      subject: isPitcher
        ? "Nomination Received — Pitch Them Perfect"
        : "You're all set! — Pitch Them Perfect",
      htmlContent: isPitcher
        ? `<h2>Hi ${reg.name},</h2><p>Your pitch nomination has been received! Our team will review every submission carefully. If selected, we'll be in touch with next steps and event details.</p><p>— Team Pitch Them Perfect</p>` : `<h2>Hi ${reg.name},</h2><p>Your spot is secured! Get ready for a night of real pitches, real people, and real connections. Event details, drink voucher info, and dress code will follow soon.</p><p>— Team Pitch Them Perfect</p>`,
    }

    const listId = getBrevoListId()
    if (listId) payload.listIds = [listId]

    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": BREVO_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!brevoRes.ok) {
      const err = await brevoRes.text()
      console.error("Brevo error:", err)
      return new Response(JSON.stringify({ error: "Email send failed", detail: err }), {
        status: 500, headers: { "Access-Control-Allow-Origin": "*" }
      })
    }

    await supabase.from("registrations").update({ email_sent: true }).eq("id", registration_id)

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Access-Control-Allow-Origin": "*" }})
  } catch (err) {
    console.error("send-confirmation error:", err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Access-Control-Allow-Origin": "*" }})
  }
})
