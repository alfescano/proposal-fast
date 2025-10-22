import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  emailType: "contract_generated" | "contract_sent_to_sign" | "signing_invitation" | "contract_signed";
  userId: string;
  contractId?: string;
}

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

async function sendEmail(req: EmailRequest) {
  try {
    // Send via Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "ProposalFast <noreply@proposalfast.com>",
        to: req.to,
        subject: req.subject,
        html: req.html,
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Log email sent successfully
    await supabase.from("email_logs").insert({
      user_id: req.userId,
      contract_id: req.contractId || null,
      recipient_email: req.to,
      email_type: req.emailType,
      subject: req.subject,
      status: "sent",
      sent_at: new Date().toISOString(),
    });

    return { success: true, messageId: data.id };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";

    // Log email failure
    await supabase.from("email_logs").insert({
      user_id: req.userId,
      contract_id: req.contractId || null,
      recipient_email: req.to,
      email_type: req.emailType,
      subject: req.subject,
      status: "failed",
      error_message: errorMsg,
    });

    throw error;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    const emailReq: EmailRequest = await req.json();
    const result = await sendEmail(emailReq);

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMsg }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
