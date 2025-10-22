import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Check, PenTool, CreditCard, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function Landing() {
  const [showDemo, setShowDemo] = useState(false);
  useEffect(() => {
    import("@/lib/analytics").then(({ events }) => {
      events.pageView("landing");
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold">
              PF
            </div>
            <span className="text-xl font-bold">ProposalFast</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/pricing">
              <Button size="sm" variant="ghost" className="hover:bg-slate-800">
                Pricing
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="sm" variant="outline" className="border-slate-600 hover:bg-slate-800">
                Dashboard
              </Button>
            </Link>
            <Link to="/login">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="space-y-6">
          <h1 className="text-6xl sm:text-7xl font-bold tracking-tight leading-tight">
            Create Professional Client Proposals
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              in 60 Seconds
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            ProposalFast helps freelancers, agencies, and service providers generate polished, customizable proposals instantly—saving time, closing more deals, and elevating your brand.
          </p>
          <div className="flex gap-4 justify-center pt-8">
            <Link to="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
                Generate My Proposal Now <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-slate-600 hover:bg-slate-800 text-lg px-8"
              onClick={() => setShowDemo(true)}
            >
              Watch It in Action
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 backdrop-blur">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold mb-2">1-Minute Proposal Generation</h3>
            <p className="text-sm text-slate-400">AI generates professional proposals in seconds</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 backdrop-blur">
            <div className="text-3xl mb-3">✅</div>
            <h3 className="font-semibold mb-2">100% Client-Ready Templates</h3>
            <p className="text-sm text-slate-400">Polished designs ready to send immediately</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 backdrop-blur">
            <div className="text-3xl mb-3">✍️</div>
            <h3 className="font-semibold mb-2">AI-Personalized for Any Industry</h3>
            <p className="text-sm text-slate-400">Works for marketing, IT, coaching, and more</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 backdrop-blur">
            <div className="text-3xl mb-3">💳</div>
            <h3 className="font-semibold mb-2">Integrated with E-sign & Payment</h3>
            <p className="text-sm text-slate-400">Collect signatures and payments seamlessly</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-slate-700/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">How ProposalFast Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-bold text-lg">1</div>
              <h3 className="text-2xl font-bold">Enter Your Details</h3>
              <p className="text-slate-400">Enter your client's name, project description, and budget</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-bold text-lg">2</div>
              <h3 className="text-2xl font-bold">AI Generates Proposal</h3>
              <p className="text-slate-400">ProposalFast instantly generates a professional HTML or PDF proposal</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-bold text-lg">3</div>
              <h3 className="text-2xl font-bold">Send & Get Paid</h3>
              <p className="text-slate-400">Review, edit, and send with one click for signature and payment</p>
            </div>
          </div>
          <p className="text-center text-slate-400 text-lg mt-12">No writing. No formatting. No stress. Just results.</p>
        </div>
      </section>

      {/* Why Businesses Choose */}
      <section className="border-t border-slate-700/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">Why Businesses Choose ProposalFast</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-3">Instant AI Generation</h3>
                <p className="text-slate-400">Save hours by generating a full proposal in seconds using advanced AI.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Professionally Designed</h3>
                <p className="text-slate-400">Every proposal is crafted with proven structure and persuasive formatting that wins more clients.</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-3">Fully Customizable</h3>
                <p className="text-slate-400">Add branding, pricing tables, timelines, scopes, and deliverables tailored to your industry.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Built to Convert</h3>
                <p className="text-slate-400">Our proposals are optimized to impress clients and increase your acceptance rate.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-slate-700/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">Trusted by Freelancers, Agencies & Consultants</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8">
              <p className="text-lg text-slate-300 mb-6">"ProposalFast helped me close my biggest client ever in less than 24 hours. It's a game-changer."</p>
              <p className="font-semibold">Marketing Agency Owner</p>
              <p className="text-slate-400">New York, NY</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8">
              <p className="text-lg text-slate-300 mb-6">"I used to spend 3 hours writing proposals. Now it takes 3 minutes, and my close rate doubled."</p>
              <p className="font-semibold">Freelancer Consultant</p>
              <p className="text-slate-400">Los Angeles, CA</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="border-t border-slate-700/50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Simple Pricing That Pays for Itself</h2>
          <p className="text-xl text-slate-300 mb-8">Close just one client and ProposalFast more than pays for itself.</p>
          <Link to="/pricing">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
              Start Free – No Credit Card Required
            </Button>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-700/50 py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">Do I need design or writing experience?</h3>
              <p className="text-slate-400">No. ProposalFast does all the writing and formatting for you using AI.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Can I use this for any industry?</h3>
              <p className="text-slate-400">Yes. It works for marketing, IT, coaching, consulting, real estate, construction, and more.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Is my data secure?</h3>
              <p className="text-slate-400">100%. All proposals are encrypted and stored securely.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-slate-700/50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Close More Clients in Less Time?</h2>
          <p className="text-xl text-slate-300 mb-8">Try ProposalFast free today and generate your first proposal in under 60 seconds.</p>
          <Link to="/login">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-12 text-center text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center gap-6 mb-6 flex-wrap">
            <Link to="#" className="hover:text-slate-300">Product</Link>
            <Link to="/pricing" className="hover:text-slate-300">Pricing</Link>
            <Link to="/terms" className="hover:text-slate-300">Terms</Link>
            <Link to="/privacy" className="hover:text-slate-300">Privacy</Link>
            <Link to="/refund" className="hover:text-slate-300">Refund Policy</Link>
            <a href="mailto:support@proposalfast.ai" className="hover:text-slate-300">Contact</a>
          </div>
          <p>© ProposalFast.ai – All Rights Reserved</p>
        </div>
      </footer>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-900">
              <h2 className="text-2xl font-bold">ProposalFast in Action</h2>
              <button 
                onClick={() => setShowDemo(false)}
                className="p-1 hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-slate-800/50 rounded-lg p-6">
                <h3 className="font-bold mb-4">How it works in 60 seconds:</h3>
                <ol className="space-y-3 text-slate-300">
                  <li className="flex gap-3">
                    <span className="text-blue-400 font-bold">1.</span>
                    <span>Enter your client name, project type, and budget</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-400 font-bold">2.</span>
                    <span>Our AI generates a professional proposal instantly</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-400 font-bold">3.</span>
                    <span>Customize branding, add e-signature, collect payment</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-400 font-bold">4.</span>
                    <span>Send to your client and close the deal</span>
                  </li>
                </ol>
              </div>

              <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-lg p-6">
                <h3 className="font-bold mb-3">What You Get:</h3>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Professional formatting & layout</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> AI-personalized content for any industry</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Customizable pricing tables & timelines</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> E-signature integration ready</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Payment collection built-in</li>
                </ul>
              </div>

              <div className="text-center space-y-4">
                <p className="text-slate-400">Average time saved: <strong className="text-white">3-4 hours per proposal</strong></p>
                <p className="text-slate-400">Average close rate improvement: <strong className="text-white">40%+</strong></p>
                <Link to="/login">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Try Free – See It Yourself
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}