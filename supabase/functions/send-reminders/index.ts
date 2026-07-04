/**
 * Edge Function: send-reminders
 * Trigger: pg_cron calls this daily at 9am
 * Finds events happening in 2 days → sends pre-event reminder.
 */

import { serve } from "https://deno.land/std0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY") || ""
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || ""
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""

serve(async (_req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const in2Days = new Date(); in2Days.setDate(in2Days.getDate() + 2)
    const target = in2Days.toISOString().split("T")[0]
    const { data: events } = await supabase.from("events").select("id").eq("is_active", true).eq("show_date", target).limit(1)
    if (!events || events.length === 0) return new Response(JSON.stringify({ message: "No event in 2 days" }), { status: 200 })
    const { data: regs } = await supabase.from("registrations").select("name, email").in("status", ["paid", "pitch", "confirmed"])
    if (!regs || regs.length === 0) return new Response(JSON.stringify({ message: "No registrants" }), { status: 200 })
    let sent = 0
    for (const r of regs) {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": BREVO_API_KEY , "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: { name: "Pitch Them Perfect", email: "pitchthemperfect@gmail.com" },
          to: [{ email: r.email, name: r.name }],
          subject: "See you in 2 days! ℔ Pitch Them Perfect",
          htmlContent: `<h2>Hi ${r.name},</h2><p>It's almost time! Pitch Them Perfect is just 2 days away.</p><p>Here's what you need to know:</p><ul><li>📍 Venue details in your confirmation email</li><li>🍎 Dress code: Smart casual</li><li>🟢 Complimentary drink voucher on arrival</li></ul><p>We can't wait to see you there! 🔥</p><p>— Team Pitch Them Perfect</p>`,
        }),
      })
      if (res.ok) sent++
    }
    return new Response(JSON.stringify({ success: true, sent }), { status: 200 })
  } catch (err) { return new Response(JSON.stringify({ error: err.message }), { status: 500 }) }
})