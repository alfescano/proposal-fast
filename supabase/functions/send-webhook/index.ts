import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WebhookRequest {
  userId: string;
  eventType: string;
  payload: Record<string, any>;
  zapierUrl?: string;
  makeUrl?: string;
  test?: boolean;
}

async function sendToWebhook(webhookUrl: string, payload: Record<string, any>) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }

    const responseText = await response.text();

    return {
      success: true,
      statusCode: response.status,
      message: responseText,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const requestData: WebhookRequest = await req.json();
    const { payload, zapierUrl, makeUrl, test } = requestData;

    let results = [];
    let sentTo = "";

    // Send to Zapier if URL provided
    if (zapierUrl) {
      try {
        const result = await sendToWebhook(zapierUrl, payload);
        results.push({ platform: "zapier", ...result });
        sentTo = "zapier";
        console.log("Zapier webhook sent successfully");
      } catch (error) {
        console.error("Zapier webhook error:", error);
        results.push({
          platform: "zapier",
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Send to Make if URL provided
    if (makeUrl) {
      try {
        const result = await sendToWebhook(makeUrl, payload);
        results.push({ platform: "make", ...result });
        sentTo = sentTo ? `${sentTo},make` : "make";
        console.log("Make webhook sent successfully");
      } catch (error) {
        console.error("Make webhook error:", error);
        results.push({
          platform: "make",
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    if (results.length === 0) {
      throw new Error("No webhook URLs provided");
    }

    return new Response(
      JSON.stringify({
        success: true,
        sentTo,
        results,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
