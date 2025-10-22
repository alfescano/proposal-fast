import { supabase } from "@/lib/supabase";

export type SubscriptionPlan = "free" | "pro" | "enterprise";

export interface UserSubscription {
  plan: SubscriptionPlan;
  status: string;
  currentPeriodEnd?: Date;
  stripeCustomerId?: string;
}

export async function getUserSubscription(userId: string): Promise<UserSubscription> {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("plan, status, current_period_end, stripe_customer_id")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return { plan: "free", status: "active" };
    }

    return {
      plan: data.plan as SubscriptionPlan,
      status: data.status,
      currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : undefined,
      stripeCustomerId: data.stripe_customer_id,
    };
  } catch {
    return { plan: "free", status: "active" };
  }
}

export function canGenerateContracts(plan: SubscriptionPlan): boolean {
  return plan === "pro" || plan === "enterprise";
}

export function canUseESignature(plan: SubscriptionPlan): boolean {
  return plan === "pro" || plan === "enterprise";
}

export function getContractLimit(plan: SubscriptionPlan): number {
  switch (plan) {
    case "free":
      return 5;
    case "pro":
      return Infinity;
    case "enterprise":
      return Infinity;
    default:
      return 5;
  }
}

export function hasFeature(plan: SubscriptionPlan, feature: string): boolean {
  const features: Record<SubscriptionPlan, string[]> = {
    free: ["basic-contracts", "pdf-download"],
    pro: [
      "basic-contracts",
      "pdf-download",
      "all-contract-types",
      "e-signing",
      "unlimited-contracts",
      "templates",
      "priority-support",
    ],
    enterprise: [
      "basic-contracts",
      "pdf-download",
      "all-contract-types",
      "e-signing",
      "unlimited-contracts",
      "templates",
      "priority-support",
      "custom-contracts",
      "team-members",
      "advanced-analytics",
      "dedicated-support",
      "integrations",
    ],
  };

  return features[plan]?.includes(feature) || false;
}
