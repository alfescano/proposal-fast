import { useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { triggerWebhook, type WebhookEventType } from "@/lib/webhookService";

export function useWebhooks() {
  const { userId } = useAuth();

  const trigger = useCallback(
    async (
      eventType: WebhookEventType,
      data?: {
        proposalId?: string;
        proposalTitle?: string;
        clientId?: string;
        clientName?: string;
        clientEmail?: string;
        amount?: number;
        teamId?: string;
        metadata?: Record<string, any>;
      }
    ) => {
      if (!userId) return false;

      try {
        const result = await triggerWebhook({
          userId,
          eventType,
          ...data,
        });

        return result.success;
      } catch (error) {
        console.error("Webhook trigger error:", error);
        return false;
      }
    },
    [userId]
  );

  // Specific event triggers
  const proposalCreated = useCallback(
    (proposalTitle: string, proposalId: string, clientName: string) =>
      trigger("proposal.created", { proposalId, proposalTitle, clientName }),
    [trigger]
  );

  const proposalSent = useCallback(
    (proposalTitle: string, proposalId: string, clientEmail: string) =>
      trigger("proposal.sent", { proposalId, proposalTitle, clientEmail }),
    [trigger]
  );

  const proposalViewed = useCallback(
    (proposalTitle: string, proposalId: string, clientName: string) =>
      trigger("proposal.viewed", { proposalId, proposalTitle, clientName }),
    [trigger]
  );

  const proposalSigned = useCallback(
    (proposalTitle: string, proposalId: string, clientName: string, amount: number) =>
      trigger("proposal.signed", { proposalId, proposalTitle, clientName, amount }),
    [trigger]
  );

  const paymentCompleted = useCallback(
    (proposalId: string, clientEmail: string, amount: number) =>
      trigger("payment.completed", { proposalId, clientEmail, amount }),
    [trigger]
  );

  const paymentFailed = useCallback(
    (proposalId: string, clientEmail: string, errorDetails?: any) =>
      trigger("payment.failed", { proposalId, clientEmail, metadata: errorDetails }),
    [trigger]
  );

  const clientInvited = useCallback(
    (clientName: string, clientEmail: string, teamId?: string) =>
      trigger("client.invited", { clientName, clientEmail, teamId }),
    [trigger]
  );

  return {
    trigger,
    proposalCreated,
    proposalSent,
    proposalViewed,
    proposalSigned,
    paymentCompleted,
    paymentFailed,
    clientInvited,
  };
}
