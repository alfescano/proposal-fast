import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface CheckoutRequest {
  userId: string;
  planId: string;
  email: string;
}

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
const APP_URL = Deno.env.get("APP_URL") || "http://localhost:3000";

const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

const STRIPE_PRICES: Record<string, string> = {
  pro: Deno.env.get("STRIPE_PRICE_PRO_MONTHLY") || "price_1SJgQw05EDRKjSG1aQCp7Si1",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    const { userId, planId, email }: CheckoutRequest = await req.json();

    if (!userId || !planId || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!STRIPE_SECRET_KEY) {
      return new Response(
        JSON.stringify({ error: "Stripe key not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get or create Stripe customer
    let stripeCustomerId: string;
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single();

    if (subscription?.stripe_customer_id) {
      stripeCustomerId = subscription.stripe_customer_id;
    } else {
      // Create new Stripe customer
      const customerResponse = await fetch("https://api.stripe.com/v1/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        },
        body: new URLSearchParams({
          email,
          metadata: JSON.stringify({ userId }),
        }),
      });

      if (!customerResponse.ok) {
        throw new Error("Failed to create Stripe customer");
      }

      const customer = await customerResponse.json();
      stripeCustomerId = customer.id;

      // Save to Supabase
      await supabase.from("subscriptions").insert({
        user_id: userId,
        stripe_customer_id: stripeCustomerId,
        plan: "free",
        status: "active",
      });
    }

    // Create checkout session
    const priceId = STRIPE_PRICES[planId];
    if (!priceId) {
      return new Response(
        JSON.stringify({ error: "Invalid plan" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const sessionResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      },
      body: new URLSearchParams({
        customer: stripeCustomerId,
        line_items: JSON.stringify([
          {
            price: priceId,
            quantity: 1,
          },
        ]),
        mode: "subscription",
        success_url: `${APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${APP_URL}/pricing`,
      }),
    });

    if (!sessionResponse.ok) {
      const error = await sessionResponse.json();
      throw new Error(`Stripe error: ${error.error?.message || "Unknown"}`);
    }

    const session = await sessionResponse.json();

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Checkout error:", errorMsg);

    return new Response(
      JSON.stringify({ error: errorMsg }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});