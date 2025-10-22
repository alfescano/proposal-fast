import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </Link>
          <h1 className="text-lg font-bold">Terms of Service</h1>
          <div />
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-invert max-w-none text-slate-300">
          <h1 className="text-4xl font-bold mb-8 text-white">Terms of Service</h1>

          <p className="text-sm text-slate-400 mb-12">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using ProposalFast.ai ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
            <p className="mb-4">
              ProposalFast is an AI-powered platform that helps freelancers, agencies, and service providers generate professional proposals and contracts. The Service includes:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li>AI-powered proposal and contract generation</li>
              <li>Customizable templates and branding</li>
              <li>PDF and HTML export capabilities</li>
              <li>E-signature integration</li>
              <li>Payment processing integration</li>
              <li>Client acceptance tracking</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">3. User Responsibilities</h2>
            <p className="mb-4">
              You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Use the Service only for lawful purposes and in a way that does not violate applicable laws</li>
              <li>Be solely responsible for all content you input into the platform</li>
              <li>Ensure all information you provide is accurate and complete</li>
              <li>Not use the Service to generate fraudulent, misleading, or illegal documents</li>
              <li>Not attempt to gain unauthorized access to the Service or its systems</li>
              <li>Not distribute or replicate ProposalFast content without permission</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">4. Intellectual Property</h2>
            <p className="mb-4">
              The Service and all its content, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio) are owned by ProposalFast, its licensors, or other providers of such material and are protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p className="mb-4">
              You retain ownership of content you create using the Service. You grant ProposalFast a license to use your content to provide and improve the Service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">5. Limitation of Liability</h2>
            <p className="mb-4">
              ProposalFast is not responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Any decisions, contracts, or business outcomes resulting from generated proposals</li>
              <li>The accuracy or completeness of AI-generated content</li>
              <li>Loss of data, revenue, or profits arising from your use of the Service</li>
              <li>Any legal disputes between you and your clients</li>
              <li>Third-party actions or services integrated with the Platform</li>
            </ul>
            <p className="mt-4">
              You agree to use ProposalFast-generated content at your own risk and should review all documents before sending to clients. You may want to consult with a legal professional for complex agreements.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">6. Subscription and Billing</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Subscription fees are charged on a recurring monthly basis on your billing date</li>
              <li>You may cancel your subscription at any time through your account settings</li>
              <li>Cancellation takes effect at the end of your current billing cycle</li>
              <li>Subscription fees are non-refundable except as explicitly stated in our Refund Policy</li>
              <li>We reserve the right to change pricing with 30 days' notice</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">7. Refund Policy</h2>
            <p className="mb-4">
              We offer a 7-day satisfaction guarantee on paid plans. If you do not see value within 7 days of upgrading, you may request a full refund. Refunds are not offered for continued usage beyond this period. All refund requests must be made in writing to support@proposalfast.ai.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">8. Data and Privacy</h2>
            <p className="mb-4">
              Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices regarding data collection and use.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">9. Modification of Terms</h2>
            <p className="mb-4">
              ProposalFast reserves the right to modify these Terms of Service at any time. If we make material changes, we will notify you by email or through the Service. Your continued use of the Service after such modifications constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">10. Termination</h2>
            <p className="mb-4">
              We may suspend or terminate your account if:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>You violate these Terms of Service</li>
              <li>You use the Service for illegal or fraudulent purposes</li>
              <li>You have failed to pay subscription fees</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">11. Disclaimers</h2>
            <p className="mb-4">
              The Service is provided "AS IS" without warranties of any kind. ProposalFast disclaims all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">12. Contact</h2>
            <p className="mb-4">
              For questions about these Terms, please contact us at:
            </p>
            <p className="font-semibold">support@proposalfast.ai</p>
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
