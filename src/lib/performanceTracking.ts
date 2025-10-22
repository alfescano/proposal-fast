import { supabase } from "@/lib/supabase";

export interface PerformanceMetric {
  metricName: string;
  value: number;
  unit?: string;
  pageUrl?: string;
  properties?: Record<string, any>;
}

export interface WebVitalMetric {
  metricName: "LCP" | "FID" | "CLS" | "FCP" | "TTFB";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  pageUrl?: string;
}

// Track performance metrics
export async function trackMetric(metric: PerformanceMetric): Promise<void> {
  try {
    if (!supabase) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    await supabase.from("performance_metrics").insert({
      user_id: userId,
      metric_name: metric.metricName,
      metric_type: getMetricType(metric.metricName),
      value: metric.value,
      unit: metric.unit || "ms",
      page_url: metric.pageUrl || window.location.pathname,
      properties: metric.properties || {},
    });
  } catch (error) {
    console.error("Performance tracking error:", error);
  }
}

// Track Web Vitals
export async function trackWebVital(vital: WebVitalMetric): Promise<void> {
  try {
    if (!supabase) return;
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    await supabase.from("web_vitals").insert({
      user_id: userId,
      metric_name: vital.metricName,
      value: vital.value,
      rating: vital.rating,
      page_url: vital.pageUrl || window.location.pathname,
    });
  } catch (error) {
    console.error("Web vital tracking error:", error);
  }
}

// Track API call performance
export async function trackApiPerformance(
  endpoint: string,
  duration: number,
  status: number
): Promise<void> {
  trackMetric({
    metricName: `api_${endpoint}`,
    value: duration,
    unit: "ms",
    properties: {
      endpoint,
      status,
    },
  });

  // Log warning if slow
  if (duration > 3000) {
    console.warn(`Slow API call: ${endpoint} took ${duration}ms`);
  }
}

// Track page load performance
export function trackPageLoad(): void {
  try {
    if (typeof window !== "undefined" && "performance" in window) {
      window.addEventListener("load", () => {
        try {
          const perfData = performance.timing;
          const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
          const connectTime = perfData.responseEnd - perfData.requestStart;
          const renderTime = perfData.domComplete - perfData.domLoading;

          trackMetric({
            metricName: "page_load_time",
            value: pageLoadTime,
            unit: "ms",
            properties: {
              connectTime,
              renderTime,
              dns: perfData.domainLookupEnd - perfData.domainLookupStart,
              tcp: perfData.connectEnd - perfData.connectStart,
            },
          });
        } catch (e) {
          console.debug("Failed to track page load:", e);
        }
      });
    }
  } catch (e) {
    console.debug("Failed to setup page load tracking:", e);
  }
}

// Setup Web Vitals tracking using PerformanceObserver
export function setupWebVitalsTracking(): void {
  try {
    if (!("PerformanceObserver" in window)) return;

    // Track LCP (Largest Contentful Paint)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        try {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          const lcp = lastEntry.renderTime || lastEntry.loadTime;

          const rating =
            lcp < 2500 ? "good" : lcp < 4000 ? "needs-improvement" : "poor";

          trackWebVital({
            metricName: "LCP",
            value: lcp,
            rating: rating as any,
          });
        } catch (e) {
          console.debug("LCP observation failed:", e);
        }
      });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch (e) {
      console.debug("LCP tracking not available");
    }

    // Track CLS (Cumulative Layout Shift)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        try {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }

          const rating = clsValue < 0.1 ? "good" : clsValue < 0.25 ? "needs-improvement" : "poor";

          trackWebVital({
            metricName: "CLS",
            value: clsValue,
            rating: rating as any,
          });
        } catch (e) {
          console.debug("CLS observation failed:", e);
        }
      });
      clsObserver.observe({ entryTypes: ["layout-shift"] });
    } catch (e) {
      console.debug("CLS tracking not available");
    }

    // Track FCP (First Contentful Paint)
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        try {
          const entries = list.getEntries();
          const fcp = entries[entries.length - 1].startTime;

          const rating = fcp < 1800 ? "good" : fcp < 3000 ? "needs-improvement" : "poor";

          trackWebVital({
            metricName: "FCP",
            value: fcp,
            rating: rating as any,
          });
        } catch (e) {
          console.debug("FCP observation failed:", e);
        }
      });
      fcpObserver.observe({ entryTypes: ["paint"] });
    } catch (e) {
      console.debug("FCP tracking not available");
    }
  } catch (e) {
    console.debug("Web vitals setup failed:", e);
  }
}

// Helper to get metric type
function getMetricType(metricName: string): string {
  if (metricName.startsWith("api_")) return "api";
  if (metricName.includes("load")) return "page_load";
  if (metricName.includes("render")) return "rendering";
  if (metricName.includes("memory")) return "memory";
  return "other";
}

// Get performance summary
export async function getPerformanceSummary(days: number = 7) {
  if (!supabase) return null;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: metrics } = await supabase
    .from("performance_metrics")
    .select("metric_name, value, metric_type")
    .gte("created_at", startDate.toISOString());

  if (!metrics) return null;

  // Calculate averages
  const summary: Record<string, { avg: number; max: number; min: number; count: number }> = {};

  metrics.forEach((m: any) => {
    if (!summary[m.metric_name]) {
      summary[m.metric_name] = { avg: 0, max: 0, min: Infinity, count: 0 };
    }
    summary[m.metric_name].avg += m.value;
    summary[m.metric_name].max = Math.max(summary[m.metric_name].max, m.value);
    summary[m.metric_name].min = Math.min(summary[m.metric_name].min, m.value);
    summary[m.metric_name].count += 1;
  });

  // Finalize averages
  Object.keys(summary).forEach((key) => {
    summary[key].avg = summary[key].avg / summary[key].count;
  });

  return summary;
}