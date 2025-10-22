import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
const CLERK_WEBHOOK_SECRET = Deno.env.get("CLERK_WEBHOOK_SECRET");

const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type, svix-id, svix-timestamp, svix-signature",
      },
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const body = await req.text();
    const headers = req.headers;

    // Verify webhook signature (if using Svix)
    const svixId = headers.get("svix-id");
    const svixTimestamp = headers.get("svix-timestamp");
    const svixSignature = headers.get("svix-signature");

    // Parse the webhook event
    const event = JSON.parse(body);
    const { type, data } = event;

    // Log event to universal events table
    try {
      await supabase.from("events").insert({
        source: "clerk",
        type: type,
        payload: event,
      });
    } catch (logError) {
      console.error("Error logging event:", logError);
    }

    // Handle user created event
    if (type === "user.created") {
      const userId = data.id;
      const email = data.email_addresses?.[0]?.email_address;

      // Track signup in analytics
      const { error: analyticsError } = await supabase.from("analytics_events").insert({
        user_id: null, // User ID not yet in our system
        event_type: "conversion",
        event_name: "signup_completed",
        page: "/login",
        properties: { email, clerkId: userId },
      });

      if (analyticsError) {
        console.error("Analytics error:", analyticsError);
      }

      // Initialize funnel stage
      const { error: funnelError } = await supabase.from("analytics_funnel").insert({
        user_id: null,
        stage: "signup",
        source: "clerk",
      });

      if (funnelError) {
        console.error("Funnel error:", funnelError);
      }

      return new Response(
        JSON.stringify({ success: true, message: "Signup tracked" }),
        { headers: { "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Handle subscription events
    if (type === "user.updated") {
      return new Response(
        JSON.stringify({ success: true, message: "User updated" }),
        { headers: { "Content-Type": "application/json" }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Event processed" }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook error:", errorMsg);

    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});