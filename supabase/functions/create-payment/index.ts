/**
 * Edge Function: create-payment
 * Creates a Ziina payment intent and returns the embedded/redirect URL.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const ZIINA_API_ORIGIN = "https://api-v2.ziina.com"
const SUCCESS_URL = Deno.env.get("SUCCESS_URL") || "https://www.pitchthemperfect.com/success/watcher"
const CANCEL_URL = Deno.env.get("CANCEL_URL") || "https://www.pitchthemperfect.com/registration"

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
    if (!amount) {
      return new Response(JSON.stringify({ error: "Amount is required" }), {
        status: 400, headers: { "Access-Control-Allow-Origin": "*" }
      })
    }

    const amountFils = Math.floor(parseFloat(amount) * 100)
    const apiKey = Deno.env.get("ZIINA_API_KEY") || ""
    const isTest = Deno.env.get("ZIINA_TEST_MODE") === "true"

    console.log(`Creating payment: AED ${amount} (${amountFils} fils), test:${isTest}`)

    const payload = {
      amount: amountFils,
      currency_code: "AED",
      message: `${role === 'pitcher' ? 'Pitch Nomination' : 'Watcher Ticket'} - Pitch Them Perfect`,
      test: isTest,
      success_url: SUCCESS_URL,
      cancel_url: CANCEL_URL,
    }

    const resp = await fetch(`${ZIINA_API_ORIGIN}/api/payment_intent`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!resp.ok) {
      const err = await resp.text()
      console.error('ZIINA error:', resp.status, err)
      return new Response(JSON.stringify({ error: "Payment creation failed", detail: err, status: resp.status }), {
        status: 500, headers: { "Access-Control-Allow-Origin": "*" }
      })
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