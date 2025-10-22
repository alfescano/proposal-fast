import { buildMemoryContext } from "./aiMemory";
import { supabase } from "./supabase";

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

  if (!token) {
    throw new Error("Authentication required");
  }

  let memoryContext = "";
  // Add memory context if enabled
  if (params.useMemory) {
    const context = await buildMemoryContext(params.clientName, params.contractType);
    if (context) {
      memoryContext = context;
    }
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-contract`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        contractType: params.contractType,
        clientName: params.clientName,
        freelancerName: params.freelancerName,
        projectScope: params.projectScope,
        budget: params.budget,
        timeline: params.timeline,
        memoryContext,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to generate contract: ${error}`);
  }

  const data = await response.json();
  return data.contract;
}

// Extract and save memory from a generated contract
export async function extractAndSaveMemory(
  contractContent: string,
  clientName: string,
  contractType: string
): Promise<void> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!token) return;

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-contract-memory`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contractContent,
          clientName,
          contractType,
        }),
      }
    );

    if (!response.ok) {
      console.error("Failed to extract contract memory");
    }
  } catch (error) {
    console.error("Error extracting contract memory:", error);
  }
}