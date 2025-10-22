import { supabase } from "@/lib/supabase";
import {
  contractGeneratedEmail,
  signingInvitationEmail,
  contractSignedEmail,
} from "@/lib/emailTemplates";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface SendEmailOptions {
  to: string;
  emailType: "contract_generated" | "contract_sent_to_sign" | "signing_invitation" | "contract_signed";
  userId: string;
  contractId?: string;
  data: Record<string, string>;
}

export async function sendTransactionalEmail({
  to,
  emailType,
  userId,
  contractId,
  data,
}: SendEmailOptions) {
  try {
    let emailTemplate;

    switch (emailType) {
      case "contract_generated":
        emailTemplate = contractGeneratedEmail(data.freelancerName, data.clientName, data.contractType);
        break;
      case "signing_invitation":
        emailTemplate = signingInvitationEmail(
          data.recipientName,
          data.senderName,
          data.contractType,
          data.signingLink
        );
        break;
      case "contract_signed":
        emailTemplate = contractSignedEmail(data.freelancerName, data.clientName, data.contractType);
        break;
      default:
        throw new Error(`Unknown email type: ${emailType}`);
    }

    // Call Supabase Edge Function
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        to,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        emailType,
        userId,
        contractId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to send email");
    }

    return await response.json();
  } catch (error) {
    console.error("Email service error:", error);
    throw error;
  }
}
