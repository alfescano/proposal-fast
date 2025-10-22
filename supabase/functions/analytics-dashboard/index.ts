import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    const { searchParams } = new URL(req.url);
    const metric = searchParams.get("metric");
    const days = parseInt(searchParams.get("days") || "30");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    if (metric === "funnel") {
      // Get funnel stage distribution
      const { data: funnelData } = await supabase
        .from("analytics_funnel")
        .select("stage, COUNT(*) as count", { count: "exact" })
        .groupBy("stage");

      return new Response(
        JSON.stringify({
          funnel: (funnelData || []).reduce(
            (acc: Record<string, number>, item: any) => {
              acc[item.stage] = item.count || 0;
              return acc;
            },
            {}
          ),
        }),
        { headers: { "Content-Type": "application/json" }, status: 200 }
      );
    }

    if (metric === "events") {
      // Get event counts by type
      const { data: eventData } = await supabase
        .from("analytics_events")
        .select("event_name, COUNT(*) as count")
        .gte("created_at", startDate.toISOString())
        .groupBy("event_name");

      return new Response(
        JSON.stringify({
          events: (eventData || []).reduce(
            (acc: Record<string, number>, item: any) => {
              acc[item.event_name] = item.count || 0;
              return acc;
            },
            {}
          ),
        }),
        { headers: { "Content-Type": "application/json" }, status: 200 }
      );
    }

    if (metric === "conversions") {
      // Get conversion funnel metrics
      const { data: conversions } = await supabase
        .from("analytics_events")
        .select("event_name, COUNT(*) as count")
        .eq("event_type", "conversion")
        .gte("created_at", startDate.toISOString())
        .groupBy("event_name");

      return new Response(
        JSON.stringify({
          conversions: (conversions || []).reduce(
            (acc: Record<string, number>, item: any) => {
              acc[item.event_name] = item.count || 0;
              return acc;
            },
            {}
          ),
        }),
        { headers: { "Content-Type": "application/json" }, status: 200 }
      );
    }

    if (metric === "daily-activity") {
      // Get daily activity over time
      const { data: dailyData } = await supabase.rpc(
        "get_daily_analytics",
        { start_date: startDate.toISOString(), days }
      );

      return new Response(
        JSON.stringify({ dailyActivity: dailyData || [] }),
        { headers: { "Content-Type": "application/json" }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown metric" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Analytics error:", errorMsg);

    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
