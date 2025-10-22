import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(supabaseUrl!, supabaseKey!);

interface SyncRequest {
  userId: string;
  proposalId: string;
  clientEmail: string;
  clientName: string;
  clientPhone?: string;
  clientCompany?: string;
  dealAmount: number;
  action: "create" | "update";
}

async function createHubSpotContact(apiKey: string, contact: any) {
  const response = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        firstname: contact.firstname || "",
        lastname: contact.lastname || "",
        email: contact.email,
        phone: contact.phone || "",
        company: contact.company || "",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create contact: ${response.statusText}`);
  }

  const data = await response.json();
  return data.id;
}

async function createHubSpotDeal(apiKey: string, deal: any, contactId: string) {
  const response = await fetch("https://api.hubapi.com/crm/v3/objects/deals", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        dealname: deal.dealname,
        dealstage: "negotiation",
        amount: deal.amount.toString(),
        closedate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      },
      associations: [
        {
          type: "deal_contact",
          id: contactId,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create deal: ${error.message}`);
  }

  const data = await response.json();
  return data.id;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { userId, proposalId, clientEmail, clientName, clientPhone, clientCompany, dealAmount, action } =
      (await req.json()) as SyncRequest;

    // Get user's HubSpot settings
    const { data: settings, error: settingsError } = await supabase
      .from("crm_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (settingsError || !settings) {
      throw new Error("CRM settings not configured");
    }

    if (!settings.auto_sync_enabled) {
      return new Response(JSON.stringify({ success: false, message: "CRM sync disabled" }), {
        status: 200,
      });
    }

    const apiKey = settings.api_key;

    if (action === "create") {
      // Parse client name
      const nameParts = clientName.trim().split(" ");
      const firstname = nameParts[0];
      const lastname = nameParts.slice(1).join(" ") || "";

      // Create contact
      let contactId: string;
      try {
        contactId = await createHubSpotContact(apiKey, {
          firstname,
          lastname,
          email: clientEmail,
          phone: clientPhone,
          company: clientCompany,
        });
      } catch (error) {
        console.error("Error creating contact:", error);
        contactId = "unknown";
      }

      // Create deal
      const dealId = await createHubSpotDeal(apiKey, {
        dealname: `Proposal for ${clientName}`,
        amount: dealAmount,
      }, contactId);

      // Store in database
      const { error: dbError } = await supabase.from("crm_deals").insert({
        proposal_id: proposalId,
        crm_deal_id: dealId,
        crm_contact_id: contactId,
        deal_name: `Proposal for ${clientName}`,
        deal_amount: dealAmount,
        deal_status: "negotiation",
      });

      if (dbError) {
        console.error("Error storing CRM deal:", dbError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          dealId,
          contactId,
          message: "CRM sync completed",
        }),
        { status: 200 }
      );
    }

    return new Response(JSON.stringify({ success: false, message: "Unknown action" }), {
      status: 400,
    });
  } catch (error) {
    console.error("CRM sync error:", error);
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      status: 500,
    });
  }
});
