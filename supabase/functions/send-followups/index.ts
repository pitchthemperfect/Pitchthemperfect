/**
 * Edge Function: send-reminders
 * Trigger: pg_cron calls this daily at 9am
 * Finds events happening in 2 days → sends pre-event reminder to all confirmed/paid registrants.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY") || ""
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || ""
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""

serve(async (_req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Find the active event happening in 2 days
    const inTwoDays = new Date()
    inTwoDays.setDate(inTwoDays.getDate() + 2)
    const targetDate = inTwoDays.toISOString().split("T")[0]

    const { data: events } = await supabase
      .from("events")
      .select("id, show_date")
      .eq("is_active", true)
      .eq("show_date", targetDate)
      .limit(1)

    if (!events || events.length === 0) {
      return new Response(JSON.stringify({ message: "No events in 2 days" }), { status: 200 })
    }

    // Get all confirmed/paid registrants for this event
    const { data: regs } = await supabase
      .from("registrations")
      .select("name, email, role, status")
      .in("status", ["paid", "confirmed", "pitch"])

    if (!regs || regs.length === 0) {
      return new Response(JSON.stringify({ message: "No registrants to remind" }), { status: 200 })
    }

    // Send emails
    let sent = 0
    for (const r of regs) {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": BREVO_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: { name: "Pitch Them Perfect", email: "hello@pitchthemperfect.com" },
          to: [{ email: r.email, name: r.name }],
          subject: "See you in 2 days! — Pitch Them Perfect",
          htmlContent: `<h2>Hi ${r.name},</h2><p>Pitch Them Perfect is just 2 days away! Here's what you need to know:</p><ul><li>📍 Venue details will be in your confirmation email</li><li>👔 Dress code: Smart casual</li><li>🥂 Complimentary drink voucher on arrival</li></ul><p>We can't wait to see you there!</p><p>— Team Pitch Them Perfect</p>`,
        }),
      })
      if (res.ok) sent++
    }

    return new Response(JSON.stringify({ success: true, sent }), { status: 200 })
  } catch (err) {
    console.error("send-reminders error:", err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
