import { loadStripe } from "@stripe/stripe-js";
import { events } from "@/lib/analytics";

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

// Initialize Stripe only if key is available, otherwise set to null
export const stripePromise = STRIPE_PUBLIC_KEY ? loadStripe(STRIPE_PUBLIC_KEY) : null;

export const PRICING_PLANS = [
  {
    name: "Free",
    id: "free",
    price: "$0",
    period: "forever",
    description: "Get started with basic contract generation",
    features: [
      "5 contracts per month",
      "PDF download",
      "Basic contract types",
      "Email support",
    ],
    cta: "Get Started",
  },
  {
    name: "Pro",
    id: "pro",
    price: "$19",
    period: "/month",
    stripePriceId: "price_pro_monthly",
    description: "For active freelancers",
    features: [
      "Unlimited contracts",
      "All contract types",
      "E-signing integration",
      "Priority support",
      "Contract templates",
      "Team collaboration (up to 3)",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    id: "enterprise",
    price: "Custom",
    period: "pricing",
    description: "For large teams and agencies",
    features: [
      "Everything in Pro",
      "Custom contracts",
      "Unlimited team members",
      "Advanced analytics",
      "Dedicated support",
      "Custom integrations",
    ],
    cta: "Contact Sales",
  },
];

export async function createCheckoutSession(
  userId: string,
  planId: string,
  email: string
): Promise<string> {
  try {
    if (!STRIPE_PUBLIC_KEY) {
      throw new Error("Stripe is not configured");
    }

    // Track checkout initiation
    events.checkoutInitiated(planId);

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          userId,
          planId,
          email,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create checkout session");
    }

    const { sessionId } = await response.json();
    return sessionId;
  } catch (error) {
    console.error("Checkout session error:", error);
    throw error;
  }
}

export async function createPortalSession(userId: string): Promise<string> {
  try {
    if (!STRIPE_PUBLIC_KEY) {
      throw new Error("Stripe is not configured");
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal-session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          userId,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create portal session");
    }

    const { url } = await response.json();
    return url;
  } catch (error) {
    console.error("Portal session error:", error);
    throw error;
  }
}