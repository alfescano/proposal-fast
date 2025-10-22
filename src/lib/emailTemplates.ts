export interface EmailTemplate {
  subject: string;
  html: string;
}

export function contractGeneratedEmail(
  freelancerName: string,
  clientName: string,
  contractType: string
): EmailTemplate {
  return {
    subject: `Your ${contractType} contract with ${clientName} is ready`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Contract Ready!</h1>
        </div>
        <div style="background: #f8fafc; padding: 40px 20px; border-radius: 0 0 8px 8px;">
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">
            Hi <strong>${freelancerName}</strong>,
          </p>
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">
            Your <strong>${contractType}</strong> contract with <strong>${clientName}</strong> has been generated and is ready to download or send for e-signing.
          </p>
          <div style="background: white; border: 1px solid #e2e8f0; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Contract Type</p>
            <p style="margin: 0; color: #1e293b; font-size: 16px; font-weight: bold;">${contractType}</p>
          </div>
          <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-top: 20px;">
            You can now:
          </p>
          <ul style="color: #334155; font-size: 14px; line-height: 1.8;">
            <li>Download the contract as a PDF</li>
            <li>Send it to your client for e-signing via SignWell</li>
            <li>Edit the contract details before sharing</li>
          </ul>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${Deno.env.get("APP_URL")}/dashboard" style="display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Contract
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 30px;">
            ProposalFast • AI-Powered Contract Generator
          </p>
        </div>
      </div>
    `,
  };
}

export function signingInvitationEmail(
  recipientName: string,
  senderName: string,
  contractType: string,
  signingLink: string
): EmailTemplate {
  return {
    subject: `${senderName} sent you a contract to review and sign`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Contract Ready for Signature</h1>
        </div>
        <div style="background: #f8fafc; padding: 40px 20px; border-radius: 0 0 8px 8px;">
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">
            Hi <strong>${recipientName}</strong>,
          </p>
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">
            <strong>${senderName}</strong> sent you a <strong>${contractType}</strong> contract to review and sign electronically.
          </p>
          <div style="background: #dbeafe; border-left: 4px solid #2563eb; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af; font-size: 14px; font-weight: bold;">
              ⏱️ Please review and sign within 7 days
            </p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${signingLink}" style="display: inline-block; background: #2563eb; color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              Review & Sign Document
            </a>
          </div>
          <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-top: 20px;">
            This link will take you to a secure signing portal where you can:
          </p>
          <ul style="color: #334155; font-size: 14px; line-height: 1.8;">
            <li>Review the full contract</li>
            <li>Request changes if needed</li>
            <li>Sign electronically with your e-signature</li>
          </ul>
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            This is a secure communication from ProposalFast. Do not share this link with others.
          </p>
        </div>
      </div>
    `,
  };
}

export function contractSignedEmail(
  freelancerName: string,
  clientName: string,
  contractType: string
): EmailTemplate {
  return {
    subject: `Contract signed! ${clientName} has signed your ${contractType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">✓ Contract Signed!</h1>
        </div>
        <div style="background: #f8fafc; padding: 40px 20px; border-radius: 0 0 8px 8px;">
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">
            Great news, <strong>${freelancerName}</strong>!
          </p>
          <p style="color: #334155; font-size: 16px; line-height: 1.6;">
            <strong>${clientName}</strong> has successfully signed your <strong>${contractType}</strong> contract.
          </p>
          <div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0; color: #166534; font-size: 14px; font-weight: bold;">
              Both parties have signed. The contract is now legally binding.
            </p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get("APP_URL")}/dashboard" style="display: inline-block; background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Download Signed Contract
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 30px;">
            ProposalFast • AI-Powered Contract Generator
          </p>
        </div>
      </div>
    `,
  };
}
