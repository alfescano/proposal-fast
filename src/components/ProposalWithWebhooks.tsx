import { useEffect } from "react";
import { useWebhooks } from "@/hooks/useWebhooks";
import { useAuth } from "@clerk/clerk-react";

interface ProposalWithWebhooksProps {
  proposalId: string;
  proposalTitle: string;
  clientId?: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  teamId?: string;
}

/**
 * Example of integrating webhooks into proposal workflow
 * 
 * Triggers these events:
 * - proposal.created - when proposal is first created
 * - proposal.sent - when proposal is sent to client
 * - proposal.viewed - when client opens/views proposal
 * - proposal.signed - when client signs proposal
 * - payment.completed - when payment is received
 * - payment.failed - when payment fails
 * - client.invited - when client is invited to team
 */
export function ProposalWithWebhooks({
  proposalId,
  proposalTitle,
  clientId,
  clientName,
  clientEmail,
  amount,
  teamId,
}: ProposalWithWebhooksProps) {
  const { userId } = useAuth();
  const {
    proposalCreated,
    proposalSent,
    proposalViewed,
    proposalSigned,
    paymentCompleted,
    paymentFailed,
    clientInvited,
  } = useWebhooks();

  // Trigger when proposal is first created
  useEffect(() => {
    const notifyCreation = async () => {
      await proposalCreated(proposalTitle, proposalId, clientName);
    };
    notifyCreation();
  }, [proposalId, proposalTitle, clientName, proposalCreated]);

  // Send proposal to client
  const handleSendProposal = async () => {
    try {
      // Send email/notification logic here
      // ...

      // Trigger webhook
      await proposalSent(proposalTitle, proposalId, clientEmail);
    } catch (error) {
      console.error("Error sending proposal:", error);
    }
  };

  // Track proposal view
  const handleProposalViewed = async () => {
    try {
      // Update view timestamp in DB
      // ...

      // Trigger webhook
      await proposalViewed(proposalTitle, proposalId, clientName);
    } catch (error) {
      console.error("Error tracking proposal view:", error);
    }
  };

  // Handle proposal signature
  const handleProposalSigned = async () => {
    try {
      // Update proposal status to signed
      // ...

      // Trigger webhook - this might kick off Make/Zapier workflows
      // such as: send celebration email, create invoice, schedule kickoff call
      await proposalSigned(proposalTitle, proposalId, clientName, amount);
    } catch (error) {
      console.error("Error handling signature:", error);
    }
  };

  // Handle successful payment
  const handlePaymentCompleted = async () => {
    try {
      // Update payment status
      // ...

      // Trigger webhook - could auto-send contract, invoice, or thank you email
      await paymentCompleted(proposalId, clientEmail, amount);
    } catch (error) {
      console.error("Error handling payment completion:", error);
    }
  };

  // Handle payment failure
  const handlePaymentFailed = async (errorDetails: any) => {
    try {
      // Log payment error
      // ...

      // Trigger webhook - could send retry prompt or alert to user
      await paymentFailed(proposalId, clientEmail, errorDetails);
    } catch (error) {
      console.error("Error handling payment failure:", error);
    }
  };

  // Invite client to team
  const handleInviteClient = async () => {
    try {
      // Send team invite email
      // ...

      // Trigger webhook - could sync to CRM, send welcome sequence, etc
      await clientInvited(clientName, clientEmail, teamId);
    } catch (error) {
      console.error("Error inviting client:", error);
    }
  };

  return {
    handleSendProposal,
    handleProposalViewed,
    handleProposalSigned,
    handlePaymentCompleted,
    handlePaymentFailed,
    handleInviteClient,
  };
}
