import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export type WebhookEventType =
  | "proposal.created"
  | "proposal.sent"
  | "proposal.viewed"
  | "proposal.signed"
  | "payment.completed"
  | "payment.failed"
  | "client.invited";

export interface WebhookPayload {
  userId: string;
  eventType: WebhookEventType;
  proposalId?: string;
  proposalTitle?: string;
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
  amount?: number;
  teamId?: string;
  metadata?: Record<string, any>;
}

interface WebhookIntegration {
  zapier_webhook_url?: string;
  make_webhook_url?: string;
  enabled: boolean;
}

/**
 * Get user's webhook integration settings
 */
export async function getWebhookIntegration(userId: string): Promise<WebhookIntegration | null> {
  try {
    const { data, error } = await supabase
      ?.from("webhook_integrations")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error; // 116 = no rows
    return data || null;
  } catch (error) {
    console.error("Failed to fetch webhook integration:", error);
    return null;
  }
}

/**
 * Update webhook integration settings
 */
export async function updateWebhookIntegration(
  userId: string,
  zapierUrl?: string,
  makeUrl?: string
) {
  try {
    const enabled = !!(zapierUrl || makeUrl);

    const { data, error } = await supabase?.from("webhook_integrations").upsert(
      {
        user_id: userId,
        zapier_webhook_url: zapierUrl || null,
        make_webhook_url: makeUrl || null,
        enabled,
      },
      { onConflict: "user_id" }
    );

    if (error) throw error;
    toast.success("Webhook integration updated");
    return data;
  } catch (error) {
    console.error("Failed to update webhook integration:", error);
    toast.error("Failed to update webhook integration");
    return null;
  }
}

/**
 * Trigger webhook event
 */
export async function triggerWebhook(payload: WebhookPayload) {
  const { userId, eventType } = payload;

  try {
    // Get webhook URLs
    const integration = await getWebhookIntegration(userId);
    if (!integration?.enabled || (!integration.zapier_webhook_url && !integration.make_webhook_url)) {
      return { success: false, reason: "Webhooks not configured" };
    }

    // Build event payload
    const eventPayload = {
      event: eventType,
      timestamp: new Date().toISOString(),
      userId,
      proposalId: payload.proposalId,
      proposalTitle: payload.proposalTitle,
      clientId: payload.clientId,
      clientName: payload.clientName,
      clientEmail: payload.clientEmail,
      amount: payload.amount,
      teamId: payload.teamId,
      metadata: payload.metadata,
    };

    // Call edge function to send webhooks
    const { data, error } = await supabase?.functions.invoke("send-webhook", {
      body: {
        userId,
        eventType,
        payload: eventPayload,
        zapierUrl: integration.zapier_webhook_url,
        makeUrl: integration.make_webhook_url,
      },
    });

    if (error) {
      console.error("Webhook send error:", error);
      return { success: false, reason: error.message };
    }

    // Log event
    await logWebhookEvent(userId, eventType, payload, data?.sentTo);

    return { success: true, data };
  } catch (error) {
    console.error("Webhook exception:", error);
    return { success: false, reason: String(error) };
  }
}

/**
 * Log webhook event
 */
async function logWebhookEvent(
  userId: string,
  eventType: WebhookEventType,
  payload: WebhookPayload,
  sentTo?: string
) {
  try {
    await supabase?.from("webhook_events").insert({
      user_id: userId,
      event_type: eventType,
      proposal_id: payload.proposalId,
      client_id: payload.clientId,
      payload,
      status: "sent",
      sent_to: sentTo || "zapier",
    });
  } catch (error) {
    console.error("Failed to log webhook event:", error);
  }
}

/**
 * Get webhook event history
 */
export async function getWebhookHistory(userId: string, limit = 20) {
  try {
    const { data, error } = await supabase
      ?.from("webhook_events")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Failed to fetch webhook history:", error);
    return [];
  }
}

/**
 * Test webhook
 */
export async function testWebhook(userId: string, webhookUrl: string, platform: "zapier" | "make") {
  try {
    const testPayload = {
      event: "test",
      timestamp: new Date().toISOString(),
      userId,
      platform,
      message: `Test event from ProposalFast - ${platform} integration working!`,
    };

    const { error } = await supabase?.functions.invoke("send-webhook", {
      body: {
        userId,
        eventType: "test",
        payload: testPayload,
        zapierUrl: platform === "zapier" ? webhookUrl : undefined,
        makeUrl: platform === "make" ? webhookUrl : undefined,
        test: true,
      },
    });

    if (error) throw error;
    toast.success(`Test event sent to ${platform}!`);
    return true;
  } catch (error) {
    console.error("Webhook test failed:", error);
    toast.error("Failed to send test event");
    return false;
  }
}

/**
 * Disable webhooks
 */
export async function disableWebhooks(userId: string) {
  try {
    const { error } = await supabase
      ?.from("webhook_integrations")
      .update({ enabled: false })
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Failed to disable webhooks:", error);
    return false;
  }
}
