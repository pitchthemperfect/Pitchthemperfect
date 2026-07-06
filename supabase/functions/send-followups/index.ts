/**
 * Edge Function: send-followups
 * Reads templates from settings, fallback to hardcoded.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY") || ""
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || ""
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
const FEEDBACK_URL = Deno.env.get("FEEDBACK_FORM_URL") || "https://www.pitchthemperfect.com"

function textToHtml(txt, name, url) {
  if (!txt) return null
  return txt
    .replace(/{{name}}/g, name)
    .replace(/{{feedback_url}}/g, url)
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

serve(async (_req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
    const targetDate = yesterday.toISOString().split("T")[0]
    const { data: events } = await supabase.from("events").select("id").eq("is_active", true).eq("show_date", targetDate).limit(1)
    if (!events || events.length === 0) return new Response(JSON.stringify({ message: "No event yesterday" }), { status: 200 })
    const { data: regs } = await supabase.from("registrations").select("name, email").in("status", ["paid"])
    if (!regs || regs.length === 0) return new Response(JSON.stringify({ message: "No attendees" }), { status: 200 })
    const subject = (await getTemplate("email_followup_subject")) || "How was Pitch Them Perfect?"
    const rawBody = (await getTemplate("email_followup_body")) || "Hi {{name}},\n\nThank you for being part of Pitch Them Perfect! Hope you had an amazing night.\n\nWe'd love to hear your thoughts:\n<a href='{{feedback_url}}'>Give Feedback</a>\n\n— Team Pitch Them Perfect"
    let sent = 0
    for (const r of regs) {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": BREVO_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: { name: "Pitch Them Perfect", email: "pitchthemperfect@gmail.com" },
          to: [{ email: r.email, name: r.name }],
          subject,
          htmlContent: textToHtml(rawBody, r.name, FEEDBACK_URL),
        }),
      })
      if (res.ok) sent++
    }
    return new Response(JSON.stringify({ success: true, sent }), { status: 200 })
  } catch (err) { return new Response(JSON.stringify({ error: err.message }), { status: 500 }) }
})