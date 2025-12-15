import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { PRICING_PLANS, createCheckoutSession, stripePromise } from "@/lib/stripe";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { events, updateFunnelStage } from "@/lib/analytics";

export default function Pricing() {
  const { user: userProfile } = useAuthContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    events?.pricingViewed?.();
    if (userProfile?.id) updateFunnelStage?.(userProfile.id, "pricing");
  }, [userProfile?.id]);

  const openContactSales = () => {
    const subject = encodeURIComponent("ProposalFast Enterprise - Contact Sales");
    const body = encodeURIComponent(
      `Hi ProposalFast team,\n\nI'm interested in the Enterprise plan.\n\nCompany/Team size:\nUse case:\nBest email to reach me:\n\nThanks!`
    );

    // Using window.open improves reliability vs href in some browsers
    window.open(`mailto:sales@proposalfast.com?subject=${subject}&body=${body}`, "_self");
  };

  const handleCheckout = async (planId: string) => {
    // Require login before any plan action
    if (!userProfile) {
      toast.info("Please sign in to continue.");
      navigate("/login");
      return;
    }

    // Free plan = no Stripe checkout
    if (planId === "free") {
      toast.success("Free plan activated! Limit: 5 contracts/month.");
      navigate("/dashboard");
      return;
    }

    // Enterprise contact sales
    if (planId === "enterprise") {
      toast.info("Opening contact sales…");
      openContactSales();
      return;
    }

    // Paid plans require Stripe configured
    if (!stripePromise) {
      toast.error("Stripe is not configured (missing VITE_STRIPE_PUBLIC_KEY).");
      return;
    }

    events?.checkoutInitiated?.(planId);
    setLoading(planId);

    try {
      const sessionId = await createCheckoutSession(
        userProfile.id,
        planId,
        userProfile.email || ""
      );

      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to load");

      const result = await stripe.redirectToCheckout({ sessionId });
      if (result.error) {
        toast.error(result.error.message || "Checkout failed");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <nav className="border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold">
              PF
            </div>
            <span className="text-lg font-bold">Pricing</span>
          </div>
          <div />
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          Pricing Plans Designed for Growth
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          Start free – upgrade only when you need more power.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
        <div className="grid md:grid-cols-3 gap-8">
          {PRICING_PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`relative border-slate-700/50 p-8 flex flex-col ${
                plan.popular
                  ? "bg-gradient-to-br from-blue-900/30 to-slate-800/50 ring-2 ring-blue-500/50 scale-105"
                  : "bg-slate-800/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-slate-400">{plan.period}</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => handleCheckout(plan.id)}
                disabled={loading === plan.id}
                className={`w-full mb-8 py-6 text-base font-semibold ${
                  plan.popular
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-slate-700 hover:bg-slate-600"
                }`}
              >
                {loading === plan.id ? "Processing..." : plan.cta}
              </Button>

              <div className="space-y-4 flex-1">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 bg-blue-900/30 border border-blue-500/50 rounded-lg p-8 text-center">
          <p className="text-xl font-semibold">
            Close one client and your subscription pays for itself. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-8 text-center text-slate-500 text-sm">
        <p>© 2025 ProposalFast. All rights reserved.</p>
      </footer>
    </div>
  );
}
