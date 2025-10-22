import { supabase } from "@/lib/supabase";

export interface Account {
  id: string;
  user_id: string;
  stripe_customer_id?: string;
  plan: "free" | "pro" | "enterprise";
  billing_status: "active" | "past_due" | "canceled" | "trial";
  trial_end_date?: string;
  company_name?: string;
  primary_contact_name?: string;
  email?: string;
  phone?: string;
  crm_id?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get or create account for user
 */
export async function getOrCreateAccount(userId: string): Promise<Account | null> {
  if (!supabase) {
    console.warn("Supabase not configured");
    return null;
  }

  try {
    // Check if account exists
    const { data: existing, error: selectError } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!selectError && existing) {
      return existing;
    }

    // Create new account
    const { data: newAccount, error: insertError } = await supabase
      .from("accounts")
      .insert([
        {
          user_id: userId,
          plan: "free",
          billing_status: "active",
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Error creating account:", insertError);
      return null;
    }

    return newAccount;
  } catch (error) {
    console.error("Error getting/creating account:", error);
    return null;
  }
}

/**
 * Get account by user ID
 */
export async function getAccount(userId: string): Promise<Account | null> {
  if (!supabase) {
    console.warn("Supabase not configured");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching account:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching account:", error);
    return null;
  }
}

/**
 * Update account fields
 */
export async function updateAccount(
  userId: string,
  updates: Partial<Account>
): Promise<Account | null> {
  if (!supabase) {
    console.warn("Supabase not configured");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("accounts")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating account:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error updating account:", error);
    return null;
  }
}

/**
 * Update Stripe information
 */
export async function updateStripeInfo(
  userId: string,
  stripeCustomerId: string,
  plan: "free" | "pro" | "enterprise",
  billingStatus: "active" | "past_due" | "canceled" | "trial"
): Promise<Account | null> {
  return updateAccount(userId, {
    stripe_customer_id: stripeCustomerId,
    plan,
    billing_status: billingStatus,
  });
}

/**
 * Set trial end date
 */
export async function setTrialEndDate(
  userId: string,
  trialEndDate: Date
): Promise<Account | null> {
  return updateAccount(userId, {
    trial_end_date: trialEndDate.toISOString(),
    billing_status: "trial",
  });
}

/**
 * Update company information
 */
export async function updateCompanyInfo(
  userId: string,
  companyInfo: {
    company_name?: string;
    primary_contact_name?: string;
    email?: string;
    phone?: string;
  }
): Promise<Account | null> {
  return updateAccount(userId, companyInfo);
}

/**
 * Update CRM integration
 */
export async function updateCRMId(userId: string, crmId: string): Promise<Account | null> {
  return updateAccount(userId, { crm_id: crmId });
}

/**
 * Get account by Stripe customer ID
 */
export async function getAccountByStripeCustomerId(
  stripeCustomerId: string
): Promise<Account | null> {
  if (!supabase) {
    console.warn("Supabase not configured");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("stripe_customer_id", stripeCustomerId)
      .single();

    if (error) {
      console.error("Error fetching account by Stripe ID:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching account by Stripe ID:", error);
    return null;
  }
}

/**
 * Get all accounts by plan
 */
export async function getAccountsByPlan(
  plan: "free" | "pro" | "enterprise"
): Promise<Account[] | null> {
  if (!supabase) {
    console.warn("Supabase not configured");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("plan", plan);

    if (error) {
      console.error("Error fetching accounts by plan:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching accounts by plan:", error);
    return null;
  }
}

/**
 * Get accounts with past due billing status
 */
export async function getPastDueAccounts(): Promise<Account[] | null> {
  if (!supabase) {
    console.warn("Supabase not configured");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("billing_status", "past_due");

    if (error) {
      console.error("Error fetching past due accounts:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching past due accounts:", error);
    return null;
  }
}

/**
 * Get accounts with expired trials
 */
export async function getExpiredTrialAccounts(): Promise<Account[] | null> {
  if (!supabase) {
    console.warn("Supabase not configured");
    return null;
  }

  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("billing_status", "trial")
      .lt("trial_end_date", now);

    if (error) {
      console.error("Error fetching expired trial accounts:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching expired trial accounts:", error);
    return null;
  }
}
