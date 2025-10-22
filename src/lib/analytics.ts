import { supabase } from "@/lib/supabase";

export type EventType = "page_view" | "action" | "conversion" | "error";

export interface AnalyticsEvent {
  eventType: EventType;
  eventName: string;
  page?: string;
  properties?: Record<string, any>;
  userId?: string;
}

export type FunnelStage = "landing" | "signup" | "generator" | "pricing" | "checkout" | "customer";

// Track events to analytics_events table
export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  try {
    if (!supabase) return;
    
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = event.userId || sessionData?.session?.user?.id;

    await supabase.from("analytics_events").insert({
      user_id: userId,
      event_type: event.eventType,
      event_name: event.eventName,
      page: event.page || window.location.pathname,
      properties: event.properties || {},
    });
  } catch (error) {
    console.error("Analytics tracking error:", error);
  }
}

// Update funnel stage
export async function updateFunnelStage(
  userId: string,
  stage: FunnelStage,
  source?: string
): Promise<void> {
  try {
    if (!supabase) return;

    const { data: existing } = await supabase
      .from("analytics_funnel")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (existing) {
      await supabase
        .from("analytics_funnel")
        .update({
          stage,
          last_visit: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
    } else {
      await supabase.from("analytics_funnel").insert({
        user_id: userId,
        stage,
        source,
        first_visit: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Funnel update error:", error);
  }
}

// Utility functions for common events
export const events = {
  pageView: (page: string) =>
    trackEvent({
      eventType: "page_view",
      eventName: `visited_${page}`,
      page,
    }),

  contractGenerated: (contractType: string, budget: string) =>
    trackEvent({
      eventType: "action",
      eventName: "contract_generated",
      properties: { contractType, budget },
    }),

  pdfDownloaded: (contractType: string) =>
    trackEvent({
      eventType: "action",
      eventName: "pdf_downloaded",
      properties: { contractType },
    }),

  signwellSent: (recipientCount: number) =>
    trackEvent({
      eventType: "action",
      eventName: "signwell_sent",
      properties: { recipientCount },
    }),

  pricingViewed: () =>
    trackEvent({
      eventType: "page_view",
      eventName: "pricing_viewed",
    }),

  checkoutInitiated: (planId: string) =>
    trackEvent({
      eventType: "action",
      eventName: "checkout_initiated",
      properties: { planId },
    }),

  subscriptionCreated: (planId: string, price: number) =>
    trackEvent({
      eventType: "conversion",
      eventName: "subscription_created",
      properties: { planId, price },
    }),

  signupStarted: () =>
    trackEvent({
      eventType: "action",
      eventName: "signup_started",
    }),

  signupCompleted: (email: string) =>
    trackEvent({
      eventType: "conversion",
      eventName: "signup_completed",
      properties: { email },
    }),
};