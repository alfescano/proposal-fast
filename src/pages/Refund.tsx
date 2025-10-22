import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Refund() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </Link>
          <h1 className="text-lg font-bold">Refund Policy</h1>
          <div />
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-invert max-w-none text-slate-300">
          <h1 className="text-4xl font-bold mb-8 text-white">Refund Policy</h1>

          <p className="text-sm text-slate-400 mb-12">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-12 bg-green-900/30 border border-green-500/50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-green-300 mb-4">7-Day Money-Back Guarantee</h2>
            <p className="text-green-100 text-lg">
              We're confident you'll love ProposalFast. If you don't, we'll refund your money—no questions asked.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">1. Refund Eligibility</h2>
            <p className="mb-4">You are eligible for a full refund if:</p>
            <ul className="list-disc list-inside space-y-3">
              <li>You request the refund within 7 days of your initial upgrade/purchase</li>
              <li>You have not requested a refund for the same subscription before</li>
              <li>The request is made in good faith for a legitimate reason</li>
            </ul>
            <p className="mt-6 text-slate-400">
              Example: If you upgrade to Pro on Monday, you must request a refund by Sunday of the same week.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">2. Refund Exclusions</h2>
            <p className="mb-4">Refunds are NOT available for:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Requests made more than 7 days after purchase</li>
              <li>Continued usage beyond the 7-day window</li>
              <li>Free plan usage (only paid plans are eligible)</li>
              <li>Annual subscription refunds (only monthly subscriptions)</li>
              <li>Duplicate refund requests for the same charge</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">3. How to Request a Refund</h2>
            <p className="mb-6 font-semibold">To request a refund, follow these steps:</p>
            
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-white mb-2">Step 1: Email Our Support Team</h3>
                  <p className="text-slate-300">
                    Send an email to <span className="font-mono bg-slate-900 px-2 py-1 rounded">support@proposalfast.ai</span> with:
                  </p>
                  <ul className="list-disc list-inside mt-2 text-slate-300 text-sm">
                    <li>Your full name</li>
                    <li>Email associated with your account</li>
                    <li>Order ID or transaction date</li>
                    <li>Brief reason for refund request</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-2">Step 2: We Review Your Request</h3>
                  <p className="text-slate-300">
                    Our team will verify your eligibility and respond within 24-48 hours.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-2">Step 3: Refund Processed</h3>
                  <p className="text-slate-300">
                    Upon approval, your refund will be processed to your original payment method within 5-10 business days.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-slate-400 text-sm">
              Note: Refunds are processed in the original currency and payment method used for purchase. Bank processing times may vary.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">4. Subscription Cancellation</h2>
            <p className="mb-4">
              You can cancel your subscription at any time from your account settings. Cancellation takes effect at the end of your current billing cycle. You will not be charged for future billing periods.
            </p>
            <p className="mb-4">
              <strong>Important:</strong> Cancellation is different from a refund. Canceling your subscription does not trigger a refund for the current billing period—it only prevents future charges.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">5. Refund Status</h2>
            <p className="mb-4">
              You can check your refund status by emailing support@proposalfast.ai with your order ID. We'll provide a status update within 24 hours.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">6. Special Cases</h2>
            
            <h3 className="text-lg font-bold text-white mb-3 mt-6">Technical Issues:</h3>
            <p className="mb-4">
              If you experienced technical issues that prevented you from using the Service, we may provide a refund or credits even outside the 7-day window. Contact support@proposalfast.ai with details.
            </p>

            <h3 className="text-lg font-bold text-white mb-3 mt-6">Billing Errors:</h3>
            <p className="mb-4">
              If you were charged in error or duplicate charges occurred, we will issue a full refund immediately plus any additional credits as compensation.
            </p>

            <h3 className="text-lg font-bold text-white mb-3 mt-6">Unauthorized Charges:</h3>
            <p className="mb-4">
              If you did not authorize a charge, contact us immediately. We'll investigate and refund the charge if fraud is confirmed.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">7. Chargeback & Disputes</h2>
            <p className="mb-4">
              If you dispute a charge with your payment provider (credit card, PayPal, etc.) instead of requesting a refund through us, we may:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Suspend your account pending investigation</li>
              <li>Retain the amount in dispute until resolved</li>
              <li>Charge a fee for chargeback processing</li>
              <li>Restrict future use of the platform</li>
            </ul>
            <p className="mt-4">
              We strongly recommend contacting us directly before initiating any disputes with your payment provider.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">8. Changes to This Policy</h2>
            <p className="mb-4">
              We may update this Refund Policy at any time. Changes will be effective immediately upon posting. Continued use of the Service constitutes acceptance of updated terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">9. Contact & Support</h2>
            <p className="mb-4">
              For refund requests or questions about this policy:
            </p>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <p className="font-semibold text-white mb-2">Email:</p>
              <p className="font-mono bg-slate-900 px-3 py-2 rounded inline-block text-blue-400">
                support@proposalfast.ai
              </p>
              <p className="mt-4 text-slate-400 text-sm">
                Response time: Within 24-48 business hours
              </p>
            </div>
          </section>

          <div className="border-t border-slate-700/50 pt-12 mt-12 text-center">
            <p className="text-slate-400 text-sm">
              © 2025 ProposalFast.ai – All Rights Reserved
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
