import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  userId: string;
  eventType: string;
  proposalId?: string;
  proposalTitle?: string;
  clientName?: string;
  amount?: number;
  errorMessage?: string;
  slackWebhookUrl?: string;
  teamsWebhookUrl?: string;
  test?: boolean;
}

function getSlackMessage(req: NotificationRequest) {
  const { eventType, proposalTitle, clientName, amount, errorMessage } = req;

  const timestamp = new Date().toISOString();

  switch (eventType) {
    case "proposal_viewed":
      return {
        text: "📊 Proposal Viewed",
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "📊 Proposal Viewed",
              emoji: true,
            },
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Proposal:*\n${proposalTitle || "Unknown"}`,
              },
              {
                type: "mrkdwn",
                text: `*Client:*\n${clientName || "Unknown"}`,
              },
            ],
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `Viewed at ${timestamp}`,
              },
            ],
          },
        ],
      };

    case "proposal_signed":
      return {
        text: "✅ Proposal Signed",
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "✅ Proposal Signed",
              emoji: true,
            },
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Proposal:*\n${proposalTitle || "Unknown"}`,
              },
              {
                type: "mrkdwn",
                text: `*Client:*\n${clientName || "Unknown"}`,
              },
              {
                type: "mrkdwn",
                text: `*Amount:*\n$${amount?.toLocaleString() || "N/A"}`,
              },
            ],
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `Signed at ${timestamp}`,
              },
            ],
          },
        ],
      };

    case "payment_failed":
      return {
        text: "❌ Payment Failed",
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "❌ Payment Failed",
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Error:*\n${errorMessage || "Payment processing failed"}`,
            },
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `Failed at ${timestamp}`,
              },
            ],
          },
        ],
      };

    case "signature_requested":
      return {
        text: "📝 Signature Requested",
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "📝 Signature Requested",
              emoji: true,
            },
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Proposal:*\n${proposalTitle || "Unknown"}`,
              },
              {
                type: "mrkdwn",
                text: `*Client:*\n${clientName || "Unknown"}`,
              },
            ],
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `Requested at ${timestamp}`,
              },
            ],
          },
        ],
      };

    case "test":
      return {
        text: "🧪 Test Notification",
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "🧪 Test Notification",
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "ProposalFast notifications are working!",
            },
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `Sent at ${timestamp}`,
              },
            ],
          },
        ],
      };

    default:
      return { text: `Event: ${eventType}` };
  }
}

async function sendSlackNotification(webhookUrl: string, req: NotificationRequest) {
  const message = getSlackMessage(req);

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    throw new Error(`Slack API error: ${response.statusText}`);
  }

  return response;
}

async function sendTeamsNotification(webhookUrl: string, req: NotificationRequest) {
  const { eventType, proposalTitle, clientName, amount, errorMessage } = req;
  const timestamp = new Date().toISOString();

  let themeColor = "#0078D4"; // Default blue
  let title = "Notification";

  switch (eventType) {
    case "proposal_viewed":
      themeColor = "#0078D4";
      title = "Proposal Viewed";
      break;
    case "proposal_signed":
      themeColor = "#28a745";
      title = "Proposal Signed";
      break;
    case "payment_failed":
      themeColor = "#dc3545";
      title = "Payment Failed";
      break;
    case "signature_requested":
      themeColor = "#17a2b8";
      title = "Signature Requested";
      break;
  }

  const payload = {
    "@type": "MessageCard",
    "@context": "https://schema.org/extensions",
    summary: title,
    themeColor,
    sections: [
      {
        activityTitle: title,
        facts: [
          proposalTitle && { name: "Proposal", value: proposalTitle },
          clientName && { name: "Client", value: clientName },
          amount && { name: "Amount", value: `$${amount.toLocaleString()}` },
          errorMessage && { name: "Error", value: errorMessage },
        ].filter(Boolean),
        markdown: true,
      },
      {
        activitySubtitle: `Sent at ${timestamp}`,
      },
    ],
  };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Teams API error: ${response.statusText}`);
  }

  return response;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const requestData: NotificationRequest = await req.json();

    let sentTo = "slack";

    // Send to Slack if webhook provided
    if (requestData.slackWebhookUrl) {
      await sendSlackNotification(requestData.slackWebhookUrl, requestData);
      sentTo = "slack";
    }
    // Send to Teams if webhook provided (fallback if no Slack)
    else if (requestData.teamsWebhookUrl) {
      await sendTeamsNotification(requestData.teamsWebhookUrl, requestData);
      sentTo = "teams";
    } else {
      throw new Error("No webhook URL provided");
    }

    return new Response(
      JSON.stringify({ success: true, sentTo }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Notification error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});