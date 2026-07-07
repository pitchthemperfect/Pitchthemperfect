/**
 * Edge Function: create-payment
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// API key loaded from Supabase secret (set via: supabase secrets set ZIINA_KEY=...)
const ZIINA_KEY = Deno.env.get("ZIINA_KEY") ?? ""

const BASE_URL = Deno.env.get("APP_BASE_URL") || "https://pitchthemperfect.vercel.app"
const CANCEL_URL = Deno.env.get("CANCEL_URL") || `${BASE_URL}/registration`

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
    const { amount, role } = await req.json()
    if (!amount) return new Response(JSON.stringify({ error: "Amount required" }), { status: 400, headers: { "Access-Control-Allow-Origin": "*" } })

    // Route success URL based on role
    const successUrl = role === 'pitcher'
      ? `${BASE_URL}/success/pitcher`
      : `${BASE_URL}/success/watcher`

    const payload = {
      amount: Math.floor(parseFloat(amount) * 100),
      currency_code: "AED",
      message: `${role === 'pitcher' ? 'Pitch Nomination' : 'Watcher Ticket'} - Pitch Them Perfect`,
      test: false,
      success_url: successUrl,
      cancel_url: CANCEL_URL,
    }

    const resp = await fetch("https://api-v2.ziina.com/api/payment_intent", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ZIINA_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!resp.ok) {
      const err = await resp.text()
      return new Response(JSON.stringify({ error: err }), { status: 500, headers: { "Access-Control-Allow-Origin": "*" } })
    }

    const data = await resp.json()
    return new Response(JSON.stringify({
      id: data.id,
      embedded_url: data.embedded_url,
      redirect_url: data.redirect_url,
    }), { status: 200, headers: { "Access-Control-Allow-Origin": "*" } })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Access-Control-Allow-Origin": "*" } })
  }
})