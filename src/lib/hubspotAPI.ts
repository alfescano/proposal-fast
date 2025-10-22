import { supabase } from "./supabase";
import { toast } from "sonner";

export interface HubSpotContact {
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  company?: string;
}

export interface HubSpotDeal {
  dealstage: string;
  dealname: string;
  amount: string;
  closedate?: string;
}

// Get user's HubSpot API key
export async function getUserHubSpotSettings(userId: string) {
  try {
    const { data, error } = await supabase
      ?.from("crm_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to fetch HubSpot settings:", error);
    return null;
  }
}

// Create or update HubSpot API key
export async function updateHubSpotSettings(
  userId: string,
  apiKey: string,
  pipelineId: string
) {
  try {
    const { data, error } = await supabase?.from("crm_settings").upsert(
      {
        user_id: userId,
        api_key: apiKey,
        pipeline_id: pipelineId,
        crm_provider: "hubspot",
      },
      { onConflict: "user_id" }
    );

    if (error) throw error;
    toast.success("HubSpot settings updated successfully");
    return data;
  } catch (error) {
    console.error("Failed to update HubSpot settings:", error);
    toast.error("Failed to update CRM settings");
    return null;
  }
}

// Create HubSpot contact
export async function createHubSpotContact(
  apiKey: string,
  contact: HubSpotContact
) {
  try {
    const response = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          firstname: contact.firstname,
          lastname: contact.lastname,
          email: contact.email,
          phone: contact.phone || "",
          company: contact.company || "",
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.id; // Contact ID
  } catch (error) {
    console.error("Failed to create HubSpot contact:", error);
    throw error;
  }
}

// Create HubSpot deal
export async function createHubSpotDeal(
  apiKey: string,
  deal: HubSpotDeal,
  contactId?: string
) {
  try {
    const response = await fetch("https://api.hubapi.com/crm/v3/objects/deals", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          dealname: deal.dealname,
          dealstage: deal.dealstage,
          amount: deal.amount,
          closedate: deal.closedate || new Date().toISOString(),
        },
        associations:
          contactId && contactId !== "unknown"
            ? [
                {
                  type: "deal_contact",
                  id: contactId,
                },
              ]
            : [],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("HubSpot API error:", errorData);
      throw new Error(`HubSpot API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.id; // Deal ID
  } catch (error) {
    console.error("Failed to create HubSpot deal:", error);
    throw error;
  }
}

// Update HubSpot deal status
export async function updateHubSpotDealStatus(
  apiKey: string,
  dealId: string,
  dealstage: "negotiation" | "qualifiedtobuy" | "presentationscheduled" | "won" | "closedlost"
) {
  try {
    const response = await fetch(
      `https://api.hubapi.com/crm/v3/objects/deals/${dealId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          properties: {
            dealstage: dealstage,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to update HubSpot deal:", error);
    throw error;
  }
}

// Store synced deal in database
export async function storeCRMDeal(
  proposalId: string,
  dealId: string,
  contactId: string | undefined,
  dealName: string,
  dealAmount: number
) {
  try {
    const { error } = await supabase?.from("crm_deals").insert({
      proposal_id: proposalId,
      crm_deal_id: dealId,
      crm_contact_id: contactId || null,
      deal_name: dealName,
      deal_amount: dealAmount,
      deal_status: "negotiation",
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Failed to store CRM deal:", error);
    return false;
  }
}

// Get CRM deal by proposal ID
export async function getCRMDealByProposal(proposalId: string) {
  try {
    const { data, error } = await supabase
      ?.from("crm_deals")
      .select("*")
      .eq("proposal_id", proposalId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to fetch CRM deal:", error);
    return null;
  }
}

// Update CRM deal status
export async function updateCRMDealStatus(
  proposalId: string,
  status: string
) {
  try {
    const { error } = await supabase
      ?.from("crm_deals")
      .update({ deal_status: status, updated_at: new Date().toISOString() })
      .eq("proposal_id", proposalId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Failed to update CRM deal status:", error);
    return false;
  }
}
