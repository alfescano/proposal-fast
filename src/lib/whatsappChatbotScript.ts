/**
 * WhatsApp Chatbot Script for ProposalFast
 * Optimized for client acquisition and proposal generation
 * Integration: Connect to Twilio, WhatsApp Business API, or similar service
 */

export interface ChatbotMessage {
  id: string;
  text: string;
  buttons?: ChatbotButton[];
  delay?: number; // milliseconds
}

export interface ChatbotButton {
  id: string;
  text: string;
  action: string;
  payload?: Record<string, unknown>;
}

/**
 * WELCOME MESSAGE - First impression, set expectations
 */
export const welcomeMessage: ChatbotMessage = {
  id: "welcome",
  text: `👋 *Welcome to ProposalFast.ai!*

I'm here to help you generate a professional proposal in under 60 seconds—no fluff, no waiting, just results.

Here's what I can do:
✅ Generate AI-powered proposals instantly
✅ Create custom PDFs & web links
✅ Add e-signatures & payment buttons
✅ Track client responses in real-time

*Ready to close your next client faster?*`,
  buttons: [
    { id: "btn_start", text: "🚀 Generate Proposal Now", action: "START_PROPOSAL" },
    { id: "btn_help", text: "❓ Show Me Options", action: "HELP" },
    { id: "btn_demo", text: "👀 See It In Action", action: "DEMO" },
  ],
};

/**
 * HELP MENU - Show all available options
 */
export const helpMenu: ChatbotMessage = {
  id: "help_menu",
  text: `*Here's what you can do:*

📋 *Generate a New Proposal*
I'll ask you a few quick questions about your client and project—then boom! Professional proposal ready in 60 seconds.

📊 *Check Proposal Status*
See which proposals your clients have opened, signed, or paid for.

💰 *Upgrade to Pro*
Unlock custom branding, payment integration, and client tracking.

🎓 *Get Help*
Have questions? I'm here to help.

*What would you like to do?*`,
  buttons: [
    { id: "btn_new", text: "📋 Generate Proposal", action: "START_PROPOSAL" },
    { id: "btn_status", text: "📊 Check Status", action: "CHECK_STATUS" },
    { id: "btn_upgrade", text: "⭐ Upgrade to Pro", action: "UPGRADE" },
    { id: "btn_back", text: "🔙 Back", action: "WELCOME" },
  ],
};

/**
 * PROPOSAL GENERATION FLOW - Step 1: Client Name
 */
export const proposalStep1: ChatbotMessage = {
  id: "proposal_step_1",
  text: `*Let's build your winning proposal!* 🎯

I just need a few details. This should take less than 60 seconds.

*Step 1 of 3:*
What is your client's name?

_(Just their first name is fine)_`,
};

/**
 * PROPOSAL GENERATION FLOW - Step 2: Service/Project
 */
export function proposalStep2(clientName: string): ChatbotMessage {
  return {
    id: "proposal_step_2",
    text: `Great, ${clientName}! 👍

*Step 2 of 3:*
What service or project are you proposing?

💡 *Examples:*
• Website redesign & development
• Social media marketing (3 months)
• Brand identity & logo design
• Cloud infrastructure setup
• Business consulting
• Graphic design package
• Video production

_Be specific so the AI can create a tailored proposal._`,
  };
}

/**
 * PROPOSAL GENERATION FLOW - Step 3: Budget/Pricing
 */
export function proposalStep3(clientName: string, service: string): ChatbotMessage {
  return {
    id: "proposal_step_3",
    text: `Nice! ${clientName} needs ${service}. Perfect! 💼

*Step 3 of 3:*
What's the estimated budget or project value?

💡 *Examples:*
• $5,000
• $10,000 - $15,000
• $500/month for 6 months
• $2,500 per deliverable

_The AI will structure the proposal around this._`,
  };
}

/**
 * PROPOSAL GENERATION - Processing
 */
export function proposalProcessing(
  clientName: string,
  service: string,
  budget: string
): ChatbotMessage {
  return {
    id: "proposal_processing",
    text: `✨ *Magic happening...*

Generating a professional proposal for:
• Client: ${clientName}
• Service: ${service}
• Budget: ${budget}

This should take about 10-15 seconds. Sit tight! ⏳`,
    delay: 2000,
  };
}

/**
 * PROPOSAL GENERATION - Success
 */
export function proposalSuccess(
  clientName: string,
  proposalId: string
): ChatbotMessage {
  return {
    id: "proposal_success",
    text: `🎉 *Your proposal is ready!*

I've created a stunning, client-ready proposal for ${clientName}'s project. It's professionally formatted, persuasive, and ready to close the deal.

*Your proposal ID:* ${proposalId}

Now, how would you like to deliver this?`,
    buttons: [
      { id: "btn_pdf", text: "📄 Send PDF", action: "FORMAT_PDF", payload: { proposalId } },
      { id: "btn_link", text: "🔗 Generate Web Link", action: "FORMAT_LINK", payload: { proposalId } },
      { id: "btn_both", text: "✅ Both (PDF + Link)", action: "FORMAT_BOTH", payload: { proposalId } },
    ],
  };
}

/**
 * DELIVERY OPTIONS - After selecting format
 */
export function deliveryOptions(proposalId: string, format: string): ChatbotMessage {
  const formatText = format === "both" ? "PDF and web link" : format === "pdf" ? "PDF" : "web link";

  return {
    id: "delivery_options",
    text: `🚀 *${formatText.toUpperCase()} is ready!*

I'm sending it now... ✅

*Next: Boost your close rate 🎯*

Want to add power-closing features?

🔏 *E-Signature Link* - Client signs directly in the proposal
💳 *Payment Button* - Collect deposit right from the proposal
📊 *Tracking* - See when client opens, reads, and signs

These features increase close rates by up to 40%.`,
    buttons: [
      { id: "btn_esign", text: "🔏 Add E-Signature", action: "ADD_ESIGN", payload: { proposalId } },
      { id: "btn_payment", text: "💳 Add Payment Button", action: "ADD_PAYMENT", payload: { proposalId } },
      { id: "btn_tracking", text: "📊 Enable Tracking", action: "ADD_TRACKING", payload: { proposalId } },
      { id: "btn_done", text: "✅ Done for Now", action: "COMPLETE" },
    ],
  };
}

/**
 * UPSELL - Highlight Pro benefits
 */
export const upsellMessage: ChatbotMessage = {
  id: "upsell_pro",
  text: `💎 *Want to do this on STEROIDS?*

⭐ *ProposalFast Pro* unlocks:
✅ Custom branding (your logo, colors, fonts)
✅ Client CRM tracking (see every interaction)
✅ Instant payment collection (Stripe, PayPal)
✅ Automated follow-up emails
✅ Proposal analytics & win rates
✅ Priority support

*Real results from Pro users:*
📈 Average close rate: *+40%*
⏱️ Time per proposal: *3 minutes → 1 minute*
💰 Revenue impact: *Pays for itself in one client*

*Pro Plan: Just $29/month* (or less with annual)
*First 7 days: 100% risk-free*

Ready to level up?`,
  buttons: [
    { id: "btn_pro_yes", text: "⭐ Upgrade to Pro", action: "UPGRADE_PRO" },
    { id: "btn_pro_later", text: "⏰ Maybe Later", action: "REMIND_LATER" },
    { id: "btn_pro_no", text: "✅ I'm Good", action: "SKIP_UPSELL" },
  ],
};

/**
 * SOCIAL PROOF - Real results from users
 */
export const socialProofMessage: ChatbotMessage = {
  id: "social_proof",
  text: `*Freelancers and agencies are already crushing it with ProposalFast:*

"_I closed my biggest client ever in 24 hours. The proposal looked so professional, they didn't even negotiate._" 
— Sarah M., Marketing Agency

"_Used to spend 3 hours writing proposals. Now 3 minutes. Close rate doubled._"
— James K., Freelance Consultant

"_ProposalFast paid for itself in the first week. Best $29 I spent._"
— Alex T., Design Studio

*Your turn is next.* ✨

Generate your first proposal now and see the difference.`,
  buttons: [
    { id: "btn_generate", text: "🚀 Generate My Proposal", action: "START_PROPOSAL" },
  ],
};

/**
 * ERROR HANDLING - Something went wrong
 */
export function errorMessage(errorType: string): ChatbotMessage {
  const errorTexts: Record<string, string> = {
    invalid_input: "❌ I didn't quite catch that. Could you try again?",
    timeout: "⏳ Things are taking longer than expected. Let's start over.",
    network: "🌐 Connection issue. Please check your internet and try again.",
    default: "❌ Something went wrong. Let's try again.",
  };

  return {
    id: "error",
    text: errorTexts[errorType] || errorTexts.default,
    buttons: [
      { id: "btn_retry", text: "🔄 Try Again", action: "RETRY" },
      { id: "btn_home", text: "🏠 Back to Menu", action: "WELCOME" },
      { id: "btn_help_contact", text: "📞 Get Help", action: "HELP_CONTACT" },
    ],
  };
}

/**
 * FEEDBACK REQUEST - After proposal generation
 */
export const feedbackMessage: ChatbotMessage = {
  id: "feedback",
  text: `🎯 *Quick question:*

How satisfied are you with your proposal?

This helps us improve ProposalFast for you.`,
  buttons: [
    { id: "btn_great", text: "⭐⭐⭐⭐⭐ Perfect!", action: "FEEDBACK_GREAT" },
    { id: "btn_good", text: "👍 Good", action: "FEEDBACK_GOOD" },
    { id: "btn_ok", text: "😐 Could be better", action: "FEEDBACK_OK" },
    { id: "btn_skip", text: "⏭️ Skip", action: "SKIP_FEEDBACK" },
  ],
};

/**
 * FOLLOW-UP - Gentle reminder for users who don't upgrade
 */
export function followUpMessage(clientName: string, proposalCount: number): ChatbotMessage {
  return {
    id: "followup",
    text: `${proposalCount === 1 ? "✨ Love your first proposal?" : `📊 You've created ${proposalCount} proposals already!`}

*You're on the Free plan.* No limits, but you're leaving money on the table.

With *Pro*, your proposals will:
💼 Include your custom branding
💳 Collect payments instantly
📊 Track client opens & signatures
📧 Send automatic follow-ups

*Average Pro user closes 40% more deals.*

${proposalCount >= 3 ? "\n*Special offer: First 3 months at 50% off* ✨" : ""}`,
    buttons: [
      {
        id: "btn_upgrade_followup",
        text: proposalCount >= 3 ? "⭐ Get 50% Off" : "⭐ Upgrade to Pro",
        action: "UPGRADE_PRO",
      },
      { id: "btn_later", text: "⏰ Later", action: "SKIP_UPGRADE" },
    ],
  };
}

/**
 * CONTACT SUPPORT - User needs help
 */
export const contactSupportMessage: ChatbotMessage = {
  id: "contact_support",
  text: `📞 *Need help?*

I can assist with:
• Generating proposals
• Formatting & delivery options
• ProposalFast Pro features
• Technical issues

*Or reach out directly:*
📧 Email: support@proposalfast.ai
💬 Live chat: https://proposalfast.ai/chat
📱 WhatsApp: Reply here anytime

What's your question?`,
  buttons: [
    { id: "btn_proposal_help", text: "📋 Proposal Help", action: "HELP_PROPOSAL" },
    { id: "btn_technical", text: "⚙️ Technical Issue", action: "HELP_TECHNICAL" },
    { id: "btn_pro_help", text: "⭐ Pro Features", action: "HELP_PRO" },
  ],
};

/**
 * EXPORT FLOW - All messages as a conversational tree
 */
export const chatbotFlows = {
  welcome: welcomeMessage,
  help: helpMenu,
  proposalStep1,
  proposalStep2,
  proposalStep3,
  proposalProcessing,
  proposalSuccess,
  deliveryOptions,
  upsell: upsellMessage,
  socialProof: socialProofMessage,
  error: errorMessage,
  feedback: feedbackMessage,
  followUp: followUpMessage,
  contactSupport: contactSupportMessage,
};

export default chatbotFlows;
