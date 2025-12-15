import { buildMemoryContext } from "./aiMemory";
import { supabase } from "./supabase";
import { getUserSubscription, getContractLimit } from "./subscriptionUtils";

export async function generateContract(params: {
  contractType: string;
  clientName: string;
  freelancerName: string;
  projectScope: string;
  budget: string;
  timeline: string;
  useMemory?: boolean;
}): Promise<string> {

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  const userId = sessionData?.session?.user?.id;

  if (!token || !userId) {
    throw new Error("Authentication required");
  }

  // 1️⃣ CHECK SUBSCRIPTION
  const subscription = await getUserSubscription(userId);
  const limit = getContractLimit(subscription.plan);

  // 2️⃣ CHECK USAGE
  const month = new Date().toISOString().slice(0, 7);

  const { data: usage } = await supabase
    .from("contract_usage")
    .select("used")
    .eq("user_id", userId)
    .eq("month", month)
    .single();

  if (usage && usage.used >= limit) {
    throw new Error("Monthly contract limit reached. Upgrade to Pro.");
  }

  // 3️⃣ GENERATE CONTRACT
  let memoryContext = "";
  if (params.useMemory) {
    memoryContext = (await buildMemoryContext(params.clientName, params.contractType)) || "";
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-contract`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...params, memoryContext }),
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  // 4️⃣ INCREMENT USAGE
  await supabase.from("contract_usage").upsert({
    user_id: userId,
    month,
    used: (usage?.used || 0) + 1,
  });

  const data = await response.json();
  return data.contract;
}
