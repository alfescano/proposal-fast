import { useCallback, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { syncProposalToCRM, markCRMDealAsWon, type ProposalData } from "@/lib/crmIntegration";
import { toast } from "sonner";

export function useCRMSync() {
  const { userId } = useAuth();
  const [syncing, setSyncing] = useState(false);

  const syncProposal = useCallback(
    async (proposal: Omit<ProposalData, "userId">) => {
      if (!userId) return;

      setSyncing(true);
      try {
        const result = await syncProposalToCRM({
          ...proposal,
          userId,
        });

        if (result.success) {
          console.log("Proposal synced to CRM successfully");
          return result.data;
        } else {
          console.log("CRM sync skipped:", result.reason);
          return null;
        }
      } catch (error) {
        console.error("CRM sync failed:", error);
        return null;
      } finally {
        setSyncing(false);
      }
    },
    [userId]
  );

  const markAsSigned = useCallback(
    async (proposalId: string) => {
      if (!userId) return;

      setSyncing(true);
      try {
        const result = await markCRMDealAsWon(proposalId, userId);

        if (result.success) {
          console.log("CRM deal marked as won");
          return true;
        } else {
          console.log("Deal update skipped:", result.reason);
          return false;
        }
      } catch (error) {
        console.error("Failed to mark deal as won:", error);
        return false;
      } finally {
        setSyncing(false);
      }
    },
    [userId]
  );

  return { syncProposal, markAsSigned, syncing };
}
