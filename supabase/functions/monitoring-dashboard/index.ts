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
    const days = parseInt(searchParams.get("days") || "7");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get error summary
    if (metric === "errors") {
      const { data: errorCounts } = await supabase
        .from("error_logs")
        .select("error_type, severity, COUNT(*) as count")
        .gte("created_at", startDate.toISOString())
        .groupBy("error_type", "severity");

      const { data: unresolvedErrors } = await supabase
        .from("error_logs")
        .select("*")
        .eq("resolved", false)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false })
        .limit(10);

      return new Response(
        JSON.stringify({
          errorCounts: (errorCounts || []).reduce(
            (acc: Record<string, any>, item: any) => {
              const key = `${item.error_type}_${item.severity}`;
              acc[key] = item.count;
              return acc;
            },
            {}
          ),
          unresolvedErrors: unresolvedErrors || [],
        }),
        { headers: { "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Get performance metrics summary
    if (metric === "performance") {
      const { data: metrics } = await supabase
        .from("performance_metrics")
        .select("metric_name, value")
        .gte("created_at", startDate.toISOString());

      const summary: Record<
        string,
        { avg: number; max: number; min: number; count: number }
      > = {};

      (metrics || []).forEach((m: any) => {
        if (!summary[m.metric_name]) {
          summary[m.metric_name] = { avg: 0, max: 0, min: Infinity, count: 0 };
        }
        summary[m.metric_name].avg += m.value;
        summary[m.metric_name].max = Math.max(summary[m.metric_name].max, m.value);
        summary[m.metric_name].min = Math.min(summary[m.metric_name].min, m.value);
        summary[m.metric_name].count += 1;
      });

      // Calculate averages
      Object.keys(summary).forEach((key) => {
        summary[key].avg = Math.round(summary[key].avg / summary[key].count);
      });

      return new Response(
        JSON.stringify({ performance: summary }),
        { headers: { "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Get Web Vitals summary
    if (metric === "vitals") {
      const { data: vitals } = await supabase
        .from("web_vitals")
        .select("metric_name, value, rating")
        .gte("created_at", startDate.toISOString());

      const vitalsRating: Record<string, { avg: number; good: number; total: number }> = {};

      (vitals || []).forEach((v: any) => {
        if (!vitalsRating[v.metric_name]) {
          vitalsRating[v.metric_name] = { avg: 0, good: 0, total: 0 };
        }
        vitalsRating[v.metric_name].avg += v.value;
        if (v.rating === "good") vitalsRating[v.metric_name].good += 1;
        vitalsRating[v.metric_name].total += 1;
      });

      // Calculate averages and percentages
      Object.keys(vitalsRating).forEach((key) => {
        vitalsRating[key].avg = Math.round(vitalsRating[key].avg / vitalsRating[key].total);
      });

      return new Response(
        JSON.stringify({ vitals: vitalsRating }),
        { headers: { "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Get error timeline (daily errors)
    if (metric === "error-timeline") {
      const { data: errorTimeline } = await supabase.rpc("get_error_timeline", {
        start_date: startDate.toISOString(),
        days,
      });

      return new Response(
        JSON.stringify({ timeline: errorTimeline || [] }),
        { headers: { "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Get API performance (slowest endpoints)
    if (metric === "api-performance") {
      const { data: apiMetrics } = await supabase
        .from("performance_metrics")
        .select("metric_name, value, properties")
        .eq("metric_type", "api")
        .gte("created_at", startDate.toISOString())
        .order("value", { ascending: false })
        .limit(20);

      return new Response(
        JSON.stringify({ apiMetrics: apiMetrics || [] }),
        { headers: { "Content-Type": "application/json" }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown metric" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Monitoring error:", errorMsg);

    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
