import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </Link>
          <h1 className="text-lg font-bold">Privacy Policy</h1>
          <div />
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-invert max-w-none text-slate-300">
          <h1 className="text-4xl font-bold mb-8 text-white">Privacy Policy</h1>

          <p className="text-sm text-slate-400 mb-12">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p className="mb-4">
              ProposalFast.ai ("Company", "we", "us", "our") operates the ProposalFast website and platform (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">2. Information Collection and Use</h2>
            <p className="mb-4 font-semibold">We collect several different types of information:</p>
            
            <h3 className="text-xl font-bold text-white mb-3 mt-6">Personal Data:</h3>
            <ul className="list-disc list-inside space-y-2 mb-6">
              <li>Email address</li>
              <li>First and last name</li>
              <li>Phone number (optional)</li>
              <li>Billing address</li>
              <li>Payment information (processed securely via Stripe)</li>
              <li>Company information</li>
            </ul>

            <h3 className="text-xl font-bold text-white mb-3">Usage Data:</h3>
            <ul className="list-disc list-inside space-y-2 mb-6">
              <li>Proposals generated and their content</li>
              <li>Features used and frequency</li>
              <li>Pages visited and time spent</li>
              <li>Device type and operating system</li>
              <li>IP address and location</li>
              <li>Analytics data (using industry-standard analytics tools)</li>
            </ul>

            <h3 className="text-xl font-bold text-white mb-3">Communication Data:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Email communications and support tickets</li>
              <li>Feedback and survey responses</li>
              <li>Customer support interactions</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">3. Why We Collect Your Data</h2>
            <p className="mb-4">We collect and use your information for:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Providing and maintaining the Service</li>
              <li>Processing subscriptions and payments</li>
              <li>Sending transactional emails (confirmations, receipts, updates)</li>
              <li>Sending promotional emails and marketing communications (with your consent)</li>
              <li>Improving and personalizing your experience</li>
              <li>Detecting and preventing fraud and abuse</li>
              <li>Complying with legal obligations</li>
              <li>Responding to your inquiries and support requests</li>
              <li>Analytics and business intelligence</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
            <p className="mb-4">
              ProposalFast is committed to protecting your data. We implement industry-standard security measures including:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>End-to-end encryption for sensitive data</li>
              <li>Secure SSL/TLS connections</li>
              <li>Regular security audits and penetration testing</li>
              <li>Restricted access to personal data (need-to-know basis)</li>
              <li>Regular employee training on data protection</li>
              <li>Secure data backup and recovery procedures</li>
            </ul>
            <p className="mt-4 text-slate-400 text-sm">
              However, no method of transmission over the Internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">5. Third-Party Services</h2>
            <p className="mb-4">
              We use third-party services to support our platform. These services have access to your information only as necessary to perform their functions:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Stripe:</strong> Payment processing (they do not store full credit card data)</li>
              <li><strong>Clerk:</strong> Authentication and user management</li>
              <li><strong>Supabase:</strong> Database hosting and backend services</li>
              <li><strong>OpenAI:</strong> AI proposal generation (prompts are not used to train models)</li>
              <li><strong>Analytics providers:</strong> Usage analytics and insights</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">6. Data Retention</h2>
            <p className="mb-4">
              We retain your personal data only as long as necessary to provide the Service or as required by law:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Account data: Retained while your account is active, then deleted after 90 days upon request</li>
              <li>Billing data: Retained for 7 years (required for tax/accounting compliance)</li>
              <li>Email communication: Retained for 1 year unless you request deletion</li>
              <li>Usage data: Aggregated and anonymized after 2 years</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">7. Your Rights</h2>
            <p className="mb-4">Depending on your location, you may have the following rights:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Correction:</strong> Correct inaccurate data</li>
              <li><strong>Right to Deletion:</strong> Request deletion of your data ("right to be forgotten")</li>
              <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Right to Opt-Out:</strong> Unsubscribe from marketing communications</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact us at support@proposalfast.ai
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">8. Cookies</h2>
            <p className="mb-4">
              We use cookies to enhance your experience. Cookies are small files stored on your device that help us remember your preferences, keep you logged in, and analyze usage patterns. You can control cookies through your browser settings, but disabling them may affect functionality.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">9. Changes to This Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy periodically. We will notify you of any material changes via email or by updating the "Last updated" date on this page. Your continued use of the Service constitutes acceptance of the updated Privacy Policy.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">10. Contact Us</h2>
            <p className="mb-4">
              If you have questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p className="font-semibold">support@proposalfast.ai</p>
            <p className="text-sm text-slate-400 mt-2">Response time: Within 48 business hours</p>
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
