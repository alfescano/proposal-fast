import { useCallback, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { sendNotification, type NotificationEvent } from "@/lib/notificationService";

export function useNotifications() {
  const { userId } = useAuth();
  const [sending, setSending] = useState(false);

  const notify = useCallback(
    async (
      eventType: NotificationEvent,
      options?: {
        proposalId?: string;
        proposalTitle?: string;
        clientName?: string;
        amount?: number;
        errorMessage?: string;
      }
    ) => {
      if (!userId) return false;

      setSending(true);
      try {
        const result = await sendNotification({
          userId,
          eventType,
          ...options,
        });

        setSending(false);
        return result.success;
      } catch (error) {
        console.error("Notification error:", error);
        setSending(false);
        return false;
      }
    },
    [userId]
  );

  const notifyProposalViewed = useCallback(
    (proposalTitle: string, clientName: string, proposalId?: string) => {
      return notify("proposal_viewed", {
        proposalId,
        proposalTitle,
        clientName,
      });
    },
    [notify]
  );

  const notifyProposalSigned = useCallback(
    (proposalTitle: string, clientName: string, amount: number, proposalId?: string) => {
      return notify("proposal_signed", {
        proposalId,
        proposalTitle,
        clientName,
        amount,
      });
    },
    [notify]
  );

  const notifySignatureRequested = useCallback(
    (proposalTitle: string, clientName: string, proposalId?: string) => {
      return notify("signature_requested", {
        proposalId,
        proposalTitle,
        clientName,
      });
    },
    [notify]
  );

  const notifyPaymentFailed = useCallback(
    (errorMessage: string) => {
      return notify("payment_failed", {
        errorMessage,
      });
    },
    [notify]
  );

  return {
    notify,
    notifyProposalViewed,
    notifyProposalSigned,
    notifySignatureRequested,
    notifyPaymentFailed,
    sending,
  };
}
