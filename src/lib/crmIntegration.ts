import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface ProposalData {
  proposalId: string;
  userId: string;
  clientEmail: string;
  clientName: string;
  clientPhone?: string;
  clientCompany?: string;
  dealAmount: number;
}

/**
 * Sync proposal to CRM (HubSpot) if user has CRM enabled
 * Creates a deal and syncs contact information
 */
export async function syncProposalToCRM(proposal: ProposalData) {
  try {
    // Check if user has CRM settings
    const { data: settings, error: settingsError } = await supabase
      ?.from("crm_settings")
      .select("auto_sync_enabled")
      .eq("user_id", proposal.userId)
      .single();

    if (settingsError || !settings) {
      // User doesn't have CRM configured, skip sync
      return { success: false, reason: "CRM not configured" };
    }

    if (!settings.auto_sync_enabled) {
      // CRM sync is disabled
      return { success: false, reason: "CRM sync disabled" };
    }

    // Call the sync-to-crm edge function
    const { data, error } = await supabase?.functions.invoke("sync-to-crm", {
      body: {
        userId: proposal.userId,
        proposalId: proposal.proposalId,
        clientEmail: proposal.clientEmail,
        clientName: proposal.clientName,
        clientPhone: proposal.clientPhone,
        clientCompany: proposal.clientCompany,
        dealAmount: proposal.dealAmount,
        action: "create",
      },
    });

    if (error) {
      console.error("CRM sync error:", error);
      toast.error("Failed to sync proposal to CRM");
      return { success: false, reason: error.message };
    }

    console.log("Proposal synced to CRM:", data);
    return { success: true, data };
  } catch (error) {
    console.error("CRM sync exception:", error);
    return { success: false, reason: String(error) };
  }
}

/**
 * Mark CRM deal as won when proposal is signed
 */
export async function markCRMDealAsWon(proposalId: string, userId: string) {
  try {
    // Get the CRM deal for this proposal
    const { data: crmDeal, error: dealError } = await supabase
      ?.from("crm_deals")
      .select("*")
      .eq("proposal_id", proposalId)
      .single();

    if (dealError || !crmDeal) {
      // No CRM deal found, skip
      return { success: false, reason: "No CRM deal found" };
    }

    // Get user's CRM settings
    const { data: settings, error: settingsError } = await supabase
      ?.from("crm_settings")
      .select("api_key")
      .eq("user_id", userId)
      .single();

    if (settingsError || !settings) {
      return { success: false, reason: "CRM settings not found" };
    }

    // Update deal status to "won" via HubSpot API
    const response = await fetch(
      `https://api.hubapi.com/crm/v3/objects/deals/${crmDeal.crm_deal_id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${settings.api_key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          properties: {
            dealstage: "won",
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update deal: ${response.statusText}`);
    }

    // Update local database
    const { error: updateError } = await supabase
      ?.from("crm_deals")
      .update({ deal_status: "won", updated_at: new Date().toISOString() })
      .eq("proposal_id", proposalId);

    if (updateError) {
      console.error("Failed to update CRM deal status:", updateError);
    }

    toast.success("Deal marked as won in HubSpot");
    return { success: true };
  } catch (error) {
    console.error("Error marking deal as won:", error);
    return { success: false, reason: String(error) };
  }
}
