/**
 * Edge Function: create-payment
 * Creates a Ziina Payment Intent and returns the embedded_url.
 * 
 * POST body: { amount: number (in AED), role: 'pitcher'|'watcher', registration_id?: string }
 * Returns: { id, redirect_url, embedded_url }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const ZIINA_API_KEY = Deno.env.get("ZIINA_API_KEY") || ""
const ZIINA_API = "https://api-v2.ziina.com/api/payment_intent"
const SUCCESS_URL = Deno.env.get("SUCCESS_URL") || "https://pitch-them-perfect.vercel.app/success/watcher"
const CANCEL_URL = Deno.env.get("CANCEL_URL") || "https://pitch-them-perfect.vercel.app/registration"

serve(async (req) => {
  // Handle CORS preflight
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
    const { amount, role } = await req.json()
    if (!amount || !role) {
      return new Response(JSON.stringify({ error: "amount and role are required" }), { status: 400, headers: {"Access-Control-Allow-Origin": "*"} })
    }

    const amountFils = Math.round(parseFloat(amount) * 100)
    const body = {
      amount: amountFils,
      currency_code: "AED",
      message: role === "pitcher"
        ? "Pitch Them Perfect — Pitcher Nomination"
        : "Pitch Them Perfect — Watcher Ticket",
      success_url: role === "pitcher"
        ? SUCCESS_URL.replace("/watcher", "/pitcher")
        : SUCCESS_URL,
      cancel_url: CANCEL_URL,
      test: (Deno.env.get("ZIINA_TEST_MODE") || "") === "true",
    }

    const res = await fetch(ZIINA_API, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ZIINA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    if (!res.ok) {
      return new Response(JSON.stringify({ error: data.message || "Ziina API error" }), { status: res.status, headers: {"Access-Control-Allow-Origin": "*"} })
    }

    return new Response(JSON.stringify({
      id: data.id,
      redirect_url: data.redirect_url,
      embedded_url: data.embedded_url,
      amount: data.amount,
      status: data.status,
    }), { status: 200, headers: {"Access-Control-Allow-Origin": "*"} })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: {"Access-Control-Allow-Origin": "*"} })
  }
})
