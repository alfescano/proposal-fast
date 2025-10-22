import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export type NotificationEvent =
  | "proposal_viewed"
  | "proposal_signed"
  | "payment_failed"
  | "signature_requested";

export interface NotificationPayload {
  userId: string;
  eventType: NotificationEvent;
  proposalId?: string;
  proposalTitle?: string;
  clientName?: string;
  amount?: number;
  errorMessage?: string;
  timestamp?: Date;
}

interface NotificationSettings {
  slack_webhook_url?: string;
  teams_webhook_url?: string;
  notify_proposal_viewed: boolean;
  notify_proposal_signed: boolean;
  notify_payment_failed: boolean;
  notify_signature_requested: boolean;
  enabled: boolean;
}

/**
 * Get user's notification settings
 */
export async function getNotificationSettings(
  userId: string
): Promise<NotificationSettings | null> {
  try {
    const { data, error } = await supabase
      ?.from("notification_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to fetch notification settings:", error);
    return null;
  }
}

/**
 * Send notification to Slack/Teams
 */
export async function sendNotification(payload: NotificationPayload) {
  const { userId, eventType, proposalId, proposalTitle, clientName, amount, errorMessage } = payload;

  try {
    // Get user settings
    const settings = await getNotificationSettings(userId);
    if (!settings?.enabled) {
      return { success: false, reason: "Notifications disabled" };
    }

    // Check if this event type should be sent
    const eventKey = `notify_${eventType}` as keyof NotificationSettings;
    if (!settings[eventKey]) {
      return { success: false, reason: `Event type ${eventType} disabled` };
    }

    // Call edge function to send notification
    const { data, error } = await supabase?.functions.invoke("send-notification", {
      body: {
        userId,
        eventType,
        proposalId,
        proposalTitle,
        clientName,
        amount,
        errorMessage,
        slackWebhookUrl: settings.slack_webhook_url,
        teamsWebhookUrl: settings.teams_webhook_url,
      },
    });

    if (error) {
      console.error("Notification send error:", error);
      return { success: false, reason: error.message };
    }

    // Log notification
    await logNotification(userId, eventType, proposalId, data?.sentTo || "slack");

    return { success: true, data };
  } catch (error) {
    console.error("Notification exception:", error);
    return { success: false, reason: String(error) };
  }
}

/**
 * Log notification event
 */
async function logNotification(
  userId: string,
  eventType: NotificationEvent,
  proposalId: string | undefined,
  sentTo: string
) {
  try {
    await supabase?.from("notification_logs").insert({
      user_id: userId,
      event_type: eventType,
      proposal_id: proposalId,
      sent_to: sentTo,
      status: "sent",
    });
  } catch (error) {
    console.error("Failed to log notification:", error);
  }
}

/**
 * Update notification settings
 */
export async function updateNotificationSettings(
  userId: string,
  settings: Partial<NotificationSettings>
) {
  try {
    const { data, error } = await supabase?.from("notification_settings").upsert(
      {
        user_id: userId,
        ...settings,
      },
      { onConflict: "user_id" }
    );

    if (error) throw error;
    toast.success("Notification settings updated");
    return data;
  } catch (error) {
    console.error("Failed to update notification settings:", error);
    toast.error("Failed to update notification settings");
    return null;
  }
}

/**
 * Test Slack webhook
 */
export async function testSlackWebhook(userId: string, webhookUrl: string) {
  try {
    const { error } = await supabase?.functions.invoke("send-notification", {
      body: {
        userId,
        eventType: "test",
        slackWebhookUrl: webhookUrl,
        test: true,
      },
    });

    if (error) throw error;
    toast.success("Test notification sent to Slack!");
    return true;
  } catch (error) {
    console.error("Slack test failed:", error);
    toast.error("Failed to send test notification");
    return false;
  }
}

/**
 * Get notification history
 */
export async function getNotificationHistory(userId: string, limit = 10) {
  try {
    const { data, error } = await supabase
      ?.from("notification_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to fetch notification history:", error);
    return [];
  }
}
