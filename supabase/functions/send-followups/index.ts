/**
 * Edge Function: send-followups
 * Trigger: pg_cron calls this daily at 9am
 * Finds events that happened yesterday → sends post-event follow-up with feedback survey.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const BREVO_API_KEY=Deno.e...Y") || ""
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || ""
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
const FEEDBACK_FORM_URL = Deno.env.get("FEEDBACK_FORM_URL") || ""

serve(async (_req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Find the event that happened yesterday
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const targetDate = yesterday.toISOString().split("T")[0]

    const { data: events } = await supabase
      .from("events")
      .select("id")
      .eq("is_active", true)
      .eq("show_date", targetDate)
      .limit(1)

    if (!events || events.length === 0) {
      return new Response(JSON.stringify({ message: "No event yesterday" }), { status: 200 })
    }

    // Get all registrants who attended
    const { data: regs } = await supabase
      .from("registrations")
      .select("name, email, role")
      .eq("attended", true)

    if (!regs || regs.length === 0) {
      return new Response(JSON.stringify({ message: "No attendees" }), { status: 200 })
    }

    // Send follow-up emails
    let sent = 0
    for (const r of regs) {
      const feedbackLink = FEEDBACK_FORM_URL || "https://www.pitchthemperfect.com"
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": BREVO_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: { name: "Pitch Them Perfect", email: "hello@pitchthemperfect.com" },
          to: [{ email: r.email, name: r.name }],
          subject: "How was Pitch Them Perfect? 💌",
          htmlContent: `<h2>Hi ${r.name},</h2><p>Thank you for being part of Pitch Them Perfect! We hope you had an amazing night.</p><p>We'd love to hear your thoughts — it takes 2 minutes and helps us make the next one even better:</p><p><a href="${feedbackLink}" style="background:#E8386D;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:700">Give Feedback</a></p><p>And if you met someone special... we'd love to know! 💕</p><p>— Team Pitch Them Perfect</p>`,
        }),
      })
      if (res.ok) sent++
    }

    return new Response(JSON.stringify({ success: true, sent }), { status: 200 })
  } catch (err) {
    console.error("send-followups error:", err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
