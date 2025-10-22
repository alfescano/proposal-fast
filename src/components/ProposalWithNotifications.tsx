import { useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@clerk/clerk-react";

interface ProposalWithNotificationsProps {
  proposalId: string;
  proposalTitle: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  onProposalViewed?: () => void;
  onProposalSigned?: () => void;
}

/**
 * Example of integrating notifications into proposal workflow
 * 
 * Usage:
 * 1. Track proposal views - send notification when client opens
 * 2. Track signatures - send notification when signed
 * 3. Handle payment failures
 * 4. Track signature requests
 */
export function ProposalWithNotifications({
  proposalId,
  proposalTitle,
  clientName,
  clientEmail,
  amount,
}: ProposalWithNotificationsProps) {
  const { userId } = useAuth();
  const {
    notifyProposalViewed,
    notifyProposalSigned,
    notifySignatureRequested,
    notifyPaymentFailed,
  } = useNotifications();

  // Notify when proposal is viewed
  useEffect(() => {
    // Call this when proposal page loads/is viewed
    const notifyView = async () => {
      await notifyProposalViewed(proposalTitle, clientName, proposalId);
    };

    notifyView();
  }, [proposalId, proposalTitle, clientName, notifyProposalViewed]);

  // Example: Send for signature
  const handleSendForSignature = async () => {
    try {
      // Call SignWell API here
      // ...

      // Notify that signature was requested
      await notifySignatureRequested(proposalTitle, clientName, proposalId);
    } catch (error) {
      console.error("Error sending for signature:", error);
    }
  };

  // Example: Handle signature completion
  const handleProposalSigned = async () => {
    try {
      // Update proposal status
      // ...

      // Notify that proposal was signed
      await notifyProposalSigned(proposalTitle, clientName, amount, proposalId);
    } catch (error) {
      console.error("Error handling signature:", error);
    }
  };

  // Example: Handle payment failure
  const handlePaymentFailure = async (errorMessage: string) => {
    try {
      // Log payment error
      // ...

      // Notify about payment failure
      await notifyPaymentFailed(errorMessage);
    } catch (error) {
      console.error("Error handling payment failure:", error);
    }
  };

  return {
    handleSendForSignature,
    handleProposalSigned,
    handlePaymentFailure,
  };
}
