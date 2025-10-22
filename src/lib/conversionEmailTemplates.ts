/**
 * Conversion-Optimized Email Templates
 * These templates are designed to convert free users to paying customers
 * using proven copywriting, social proof, and urgency tactics
 */

export interface ConversionEmail {
  subject: string;
  preheader: string;
  html: string;
}

/**
 * Email 1: Welcome / Free Trial Activation
 * Sent immediately after signup
 * Goal: Get user to generate their first proposal
 */
export function welcomeEmail(firstName: string): ConversionEmail {
  return {
    subject: "Your First Proposal Is Ready to Be Created 🚀",
    preheader: "60 seconds to your first client-ready proposal",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%); color: white; padding: 40px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px; font-weight: 700; line-height: 1.2;">
            Welcome to ProposalFast
          </h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.95;">
            You're seconds away from generating your first professional proposal
          </p>
        </div>

        <!-- Main Content -->
        <div style="background: white; padding: 40px 20px;">
          <p style="margin: 0 0 20px 0; color: #1e293b; font-size: 16px; line-height: 1.6;">
            Hi <strong>${firstName}</strong>,
          </p>
          
          <p style="margin: 0 0 20px 0; color: #475569; font-size: 16px; line-height: 1.6;">
            You're officially seconds away from generating your first professional proposal with AI.
          </p>

          <p style="margin: 0 0 30px 0; color: #64748b; font-size: 15px; line-height: 1.6; font-style: italic;">
            No writing. No formatting. No stress. Just results.
          </p>

          <!-- CTA Section -->
          <div style="background: #f1f5f9; padding: 30px; border-radius: 8px; text-align: center; margin: 30px 0;">
            <p style="margin: 0 0 15px 0; color: #334155; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
              Get Started Now
            </p>
            <a href="https://proposalfast.ai/login" style="display: inline-block; background: #2563eb; color: white; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 16px; transition: background 0.2s;">
              Generate My Proposal Now →
            </a>
            <p style="margin: 15px 0 0 0; color: #64748b; font-size: 12px;">
              Takes less than 1 minute
            </p>
          </div>

          <!-- Social Proof -->
          <div style="background: #f0fdf4; border-left: 4px solid #4ade80; padding: 15px; border-radius: 4px; margin: 25px 0;">
            <p style="margin: 0; color: #166534; font-size: 14px; font-weight: 600;">
              ✓ Join 1,000+ freelancers and agencies already winning more clients faster
            </p>
          </div>

          <!-- What's Included -->
          <p style="margin: 30px 0 15px 0; color: #1e293b; font-size: 14px; font-weight: 600;">
            With your free account, you get:
          </p>
          <ul style="margin: 0 0 20px 0; padding: 0; list-style: none; color: #475569; font-size: 14px; line-height: 1.8;">
            <li style="margin: 8px 0;">✅ Unlimited proposal generation</li>
            <li style="margin: 8px 0;">✅ AI-powered content writing</li>
            <li style="margin: 8px 0;">✅ Professional, client-ready templates</li>
            <li style="margin: 8px 0;">✅ PDF & HTML download</li>
          </ul>

          <!-- Support -->
          <p style="margin: 30px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
            If you have any questions, just reply to this email — we're here to help you win more clients!
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #1e293b; color: #cbd5e1; padding: 30px 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0 0 10px 0;">
            <strong style="color: #ffffff;">ProposalFast.ai</strong> — AI-Powered Proposal Generator
          </p>
          <p style="margin: 0 0 15px 0; color: #94a3b8; font-size: 11px;">
            © 2025 ProposalFast. All rights reserved.
          </p>
          <p style="margin: 0; color: #64748b; font-size: 11px;">
            <a href="#" style="color: #94a3b8; text-decoration: none;">Unsubscribe</a> | 
            <a href="#" style="color: #94a3b8; text-decoration: none;">Privacy Policy</a> | 
            <a href="#" style="color: #94a3b8; text-decoration: none;">Terms</a>
          </p>
        </div>
      </div>
    `,
  };
}

/**
 * Email 2: Conversion Nurture
 * Sent 3-5 days after signup if no upgrade yet
 * Goal: Highlight Pro benefits with social proof and specific metrics
 */
export function conversionNurtureEmail(firstName: string): ConversionEmail {
  return {
    subject: "See How Pros Close Clients 2x Faster (+ Save 3 Hours/Week)",
    preheader: "The upgrade that pays for itself in one client",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%); color: white; padding: 40px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 700;">
            Double Your Client Wins
          </h1>
          <p style="margin: 10px 0 0 0; font-size: 15px; opacity: 0.95;">
            with ProposalFast Pro
          </p>
        </div>

        <!-- Main Content -->
        <div style="background: white; padding: 40px 20px;">
          <p style="margin: 0 0 20px 0; color: #1e293b; font-size: 16px; line-height: 1.6;">
            Hi <strong>${firstName}</strong>,
          </p>

          <!-- Key Insight -->
          <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 20px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af; font-size: 16px; font-weight: 700; line-height: 1.5;">
              Professionals using ProposalFast Pro close clients 2x faster and report 40% more conversions.
            </p>
          </div>

          <p style="margin: 20px 0; color: #475569; font-size: 15px; line-height: 1.6;">
            Every proposal is optimized to impress, convert, and secure payment. Here's what Pro users get:
          </p>

          <!-- Feature Highlights -->
          <table style="width: 100%; margin: 25px 0; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 15px 0; color: #1e293b; font-size: 16px; font-weight: 600;">✅ AI-Written Content</td>
              <td style="padding: 15px 0 15px 15px; color: #64748b; font-size: 14px;">Persuasive, industry-specific copy</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 15px 0; color: #1e293b; font-size: 16px; font-weight: 600;">✅ Custom Branding</td>
              <td style="padding: 15px 0 15px 15px; color: #64748b; font-size: 14px;">Add your logo & branded templates</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 15px 0; color: #1e293b; font-size: 16px; font-weight: 600;">✅ E-Signature Ready</td>
              <td style="padding: 15px 0 15px 15px; color: #64748b; font-size: 14px;">Send for signature + track acceptance</td>
            </tr>
            <tr>
              <td style="padding: 15px 0; color: #1e293b; font-size: 16px; font-weight: 600;">✅ Payment Integration</td>
              <td style="padding: 15px 0 15px 15px; color: #64748b; font-size: 14px;">Stripe, PayPal, Stripe Connect</td>
            </tr>
          </table>

          <!-- ROI Message -->
          <div style="background: #f0fdf4; border-left: 4px solid #4ade80; padding: 20px; border-radius: 4px; margin: 25px 0;">
            <p style="margin: 0 0 10px 0; color: #166534; font-size: 16px; font-weight: 700;">
              💰 Real talk: Close just ONE client with Pro and your subscription pays for itself.
            </p>
            <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.6;">
              At $29/month, that's an easy ROI on your first deal.
            </p>
          </div>

          <!-- CTA -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://proposalfast.ai/pricing" style="display: inline-block; background: #2563eb; color: white; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 16px; transition: background 0.2s;">
              Upgrade to Pro (Just $29/mo) →
            </a>
            <p style="margin: 15px 0 0 0; color: #64748b; font-size: 13px;">
              Cancel anytime. 7-day money-back guarantee.
            </p>
          </div>

          <!-- Testimonial -->
          <div style="background: #f1f5f9; padding: 20px; border-radius: 6px; margin: 25px 0; border-left: 4px solid #2563eb;">
            <p style="margin: 0 0 10px 0; color: #475569; font-size: 14px; font-style: italic; line-height: 1.6;">
              "I used to spend 3 hours writing proposals. Now it takes 3 minutes, and my close rate doubled. Pro paid for itself in week one."
            </p>
            <p style="margin: 0; color: #1e293b; font-weight: 600; font-size: 13px;">
              — Marcus J., Freelance Consultant
            </p>
          </div>

          <p style="margin: 20px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
            Start winning clients the smart way. Upgrade to Pro today.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #1e293b; color: #cbd5e1; padding: 30px 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0 0 10px 0;">
            <strong style="color: #ffffff;">ProposalFast.ai</strong> — AI-Powered Proposal Generator
          </p>
          <p style="margin: 0; color: #64748b; font-size: 11px;">
            <a href="#" style="color: #94a3b8; text-decoration: none;">Unsubscribe</a> | 
            <a href="#" style="color: #94a3b8; text-decoration: none;">Privacy Policy</a>
          </p>
        </div>
      </div>
    `,
  };
}

/**
 * Email 3: Last Chance / Urgency
 * Sent 7-10 days after signup if still no upgrade
 * Goal: Create urgency with price increase messaging and risk reversal
 */
export function urgencyEmail(firstName: string): ConversionEmail {
  return {
    subject: "Last Day: Current Pricing Ends Tomorrow",
    preheader: "Lock in $29/month before price increase",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc;">
        <!-- Alert Header -->
        <div style="background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); color: white; padding: 30px 20px; text-align: center;">
          <p style="margin: 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; opacity: 0.95;">
            ⏰ Time Sensitive
          </p>
          <h1 style="margin: 8px 0 0 0; font-size: 28px; font-weight: 700;">
            Last Day: Lock In Your Spot
          </h1>
        </div>

        <!-- Main Content -->
        <div style="background: white; padding: 40px 20px;">
          <p style="margin: 0 0 20px 0; color: #1e293b; font-size: 16px; line-height: 1.6;">
            Hi <strong>${firstName}</strong>,
          </p>

          <!-- Urgency Box -->
          <div style="background: #fef2f2; border: 2px solid #dc2626; border-radius: 6px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 10px 0; color: #7f1d1d; font-size: 16px; font-weight: 700;">
              This is your last chance to lock in ProposalFast Pro at <strong>$29/month</strong>
            </p>
            <p style="margin: 0; color: #991b1b; font-size: 14px;">
              Starting tomorrow, new subscribers will be charged <strong>$49/month</strong>
            </p>
          </div>

          <!-- The Math -->
          <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; border-radius: 4px; margin: 25px 0;">
            <p style="margin: 0 0 15px 0; color: #166534; font-size: 15px; font-weight: 700;">
              🧮 The Math is Simple:
            </p>
            <p style="margin: 0 0 10px 0; color: #166534; font-size: 14px; line-height: 1.6;">
              If you close just <strong>one client</strong> with ProposalFast Pro, your subscription pays for itself instantly. Everything else is profit.
            </p>
            <p style="margin: 0; color: #166534; font-size: 12px; font-style: italic;">
              Most users close their first deal in the first week.
            </p>
          </div>

          <!-- What's at Stake -->
          <p style="margin: 25px 0 15px 0; color: #1e293b; font-size: 15px; font-weight: 600;">
            Don't miss out on:
          </p>
          <ul style="margin: 0 0 20px 0; padding: 0; list-style: none; color: #475569; font-size: 14px; line-height: 2;">
            <li>⚡ Custom branding with your logo</li>
            <li>✍️ Advanced AI content personalization</li>
            <li>🔏 E-signature & payment integration</li>
            <li>📊 Proposal acceptance tracking</li>
          </ul>

          <!-- Primary CTA -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://proposalfast.ai/pricing" style="display: inline-block; background: #dc2626; color: white; padding: 18px 45px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 16px; transition: background 0.2s;">
              Upgrade NOW at $29/month
            </a>
            <p style="margin: 15px 0 0 0; color: #64748b; font-size: 13px;">
              7-day money-back guarantee • Cancel anytime • No questions asked
            </p>
          </div>

          <!-- Risk Reversal -->
          <div style="background: #f0f9ff; border: 1px dashed #0284c7; border-radius: 6px; padding: 15px; margin: 25px 0; text-align: center;">
            <p style="margin: 0; color: #0369a1; font-size: 13px; font-weight: 600;">
              ✓ Try Pro risk-free for 7 days. If you don't love it, we'll refund you completely.
            </p>
          </div>

          <p style="margin: 20px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
            Your opportunity is waiting. Don't leave money on the table.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #1e293b; color: #cbd5e1; padding: 30px 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0 0 10px 0;">
            <strong style="color: #ffffff;">ProposalFast.ai</strong> — AI-Powered Proposal Generator
          </p>
          <p style="margin: 0; color: #64748b; font-size: 11px;">
            <a href="#" style="color: #94a3b8; text-decoration: none;">Unsubscribe</a> | 
            <a href="#" style="color: #94a3b8; text-decoration: none;">Privacy Policy</a>
          </p>
        </div>
      </div>
    `,
  };
}

export default {
  welcomeEmail,
  conversionNurtureEmail,
  urgencyEmail,
};
