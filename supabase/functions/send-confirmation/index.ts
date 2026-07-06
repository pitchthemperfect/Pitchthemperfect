/**
 * Edge Function: send-confirmation
 * Reads email templates from settings table, falls back to hardcoded.
 */

import { serve } from "https://deno.land/std0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY") || ""
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || ""
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""

async function getTemplate(hash) {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data } = await supabase.from("settings").select("value").eq("key", hash).single()
    return data?.value || null
  } catch { return null }
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
      return new Response(JSON.stringify({ error: "Registration not found" }), { status: 404, headers: { "Access-Control-Allow-Origin": "*" }})
    }

    const isPitcher = reg.role === "pitcher"
    const prefix = `${isPitcher ? 'pitcher' : 'watcher'}`

    // Fetch templates from settings, with fallback
    const subject = await getTemplate(`email_conf_${prefix}_subject`)
        || (isPitcher ? "Nomination Received — Pitch Them Perfect" : "You're all set! — Pitch Them Perfect")

    const body = await getTemplate(`email_conf_${prefix}_body`)
        || (isPitcher
        ? `<h2>Hi ${reg.name},</h2><p>Your pitch nomination has been received! Our team will review every submission carefully. If selected, we'll be in touch with next steps and event details.</p><p>— Team Pitch Them Perfect</p>`
        : `<h2>Hi ${reg.name},</h2><p>Your spot is secured! Get ready for a night of real pitches, real people, and real connections.</p><p>— Team Pitch Them Perfect</p>`)

    const payload = {
      sender: { name: "Pitch Them Perfect", email: "pitchthemperfect@gmail.com" },
      to: [{ email: reg.email, name: reg.name }],
      subject,
      htmlContent: body.replace(/\{\{name\}\}/g, reg.name),
    }

    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": BREVO_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!brevoRes.ok) {
      const err = await brevoRes.text()
      return new Response(JSON.stringify({ error: "Email send failed", detail: err }), { status: 500, headers: { "Access-Control-Allow-Origin": "*" } })
    }

    await supabase.from("registrations").update({ email_sent: true }).eq("id", registration_id)

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Access-Control-Allow-Origin": "*" } })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Access-Control-Allow-Origin": "*" } })
  }
})