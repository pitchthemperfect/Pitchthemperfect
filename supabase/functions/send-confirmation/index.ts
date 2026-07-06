/**
 * Edge Function: send-confirmation
 * Reads templates from settings table, fallback to hardcoded.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY") || ""
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || ""
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""

function textToHtml(txt, name) {
  if (!txt) return null
  return txt
    .replace(/\{\{name\}\}/g, name)
    .split('\n\n')
    .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('')
}

async function getTemplate(keyname) {
  try {
    const sp = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data } = await sp.from("settings").select("value").eq("key", keyname).single()
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
      return new Response(JSON.stringify({ error: "Registration not found" }), { status: 404, headers: { "Access-Control-Allow-Origin": "*" } })
    }

    const isPitcher = reg.role === "pitcher"
    const prefix = isPitcher ? "pitcher" : "watcher"

    // Try template from settings, fallback to hardcoded
    const fallbackSubject = isPitcher
      ? "Nomination Received — Pitch Them Perfect"
      : "You're all set! — Pitch Them Perfect"

    const fallbackBody = isPitcher
      ? `Hi ${reg.name},\n\nThank you for submitting a pitch nomination! Our team will review every submission carefully.\n\nIf selected, we'll be in touch with next steps and event details.\n\n— Team Pitch Them Perfect`
      : `Hi ${reg.name},\n\nYour spot is secured! Get ready for a night of real pitches, real people, and real connections.\n\nEvent details, drink voucher info, and dress code will follow soon.\n\n— Team Pitch Them Perfect`

    const subject = (await getTemplate(`email_conf_${prefix}_subject`)) || fallbackSubject
    const rawBody = (await getTemplate(`email_conf_${prefix}_body`)) || fallbackBody

    const payload = {
      sender: { name: "Pitch Them Perfect", email: "pitchthemperfect@gmail.com" },
      to: [{ email: reg.email, name: reg.name }],
      subject,
      htmlContent: textToHtml(rawBody, reg.name),
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