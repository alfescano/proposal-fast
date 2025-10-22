import { supabase } from "@/lib/supabase";

export interface ClientPreference {
  id?: string;
  clientName: string;
  tone?: string;
  industry?: string;
  preferredStyle?: string;
  keyTerms?: string[];
  contractCount?: number;
  lastContractId?: string;
}

export interface ContractPattern {
  id?: string;
  contractType: string;
  patternName: string;
  patternData: Record<string, any>;
  usageCount?: number;
  successScore?: number;
}

export interface ContentSnippet {
  id?: string;
  category: string;
  snippetText: string;
  contextTags?: string[];
  usageCount?: number;
  effectivenessScore?: number;
}

// Get or create client preference
export async function getClientPreference(
  clientName: string
): Promise<ClientPreference | null> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (!userId) return null;

    const { data, error } = await supabase
      .from("client_preferences")
      .select("*")
      .eq("user_id", userId)
      .eq("client_name", clientName)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching client preference:", error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error("Error getting client preference:", error);
    return null;
  }
}

// Save/update client preference
export async function saveClientPreference(
  preference: ClientPreference
): Promise<void> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (!userId) return;

    const { error } = await supabase.from("client_preferences").upsert(
      {
        user_id: userId,
        client_name: preference.clientName,
        tone: preference.tone,
        industry: preference.industry,
        preferred_style: preference.preferredStyle,
        key_terms: preference.keyTerms || [],
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,client_name",
      }
    );

    if (error) throw error;
  } catch (error) {
    console.error("Error saving client preference:", error);
  }
}

// Get all client preferences
export async function getAllClientPreferences(): Promise<ClientPreference[]> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (!userId) return [];

    const { data, error } = await supabase
      .from("client_preferences")
      .select("*")
      .eq("user_id", userId)
      .order("contract_count", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching client preferences:", error);
    return [];
  }
}

// Save contract pattern (after successful generation)
export async function saveContractPattern(
  pattern: ContractPattern
): Promise<void> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (!userId) return;

    const { error } = await supabase.from("contract_patterns").insert({
      user_id: userId,
      contract_type: pattern.contractType,
      pattern_name: pattern.patternName,
      pattern_data: pattern.patternData,
      usage_count: 1,
      success_score: 0.8,
    });

    if (error) throw error;
  } catch (error) {
    console.error("Error saving contract pattern:", error);
  }
}

// Get patterns for contract type
export async function getContractPatterns(
  contractType: string
): Promise<ContractPattern[]> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (!userId) return [];

    const { data, error } = await supabase
      .from("contract_patterns")
      .select("*")
      .eq("user_id", userId)
      .eq("contract_type", contractType)
      .order("success_score", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching contract patterns:", error);
    return [];
  }
}

// Save content snippet
export async function saveContentSnippet(
  snippet: ContentSnippet
): Promise<void> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (!userId) return;

    const { error } = await supabase.from("content_snippets").insert({
      user_id: userId,
      category: snippet.category,
      snippet_text: snippet.snippetText,
      context_tags: snippet.contextTags || [],
      usage_count: 1,
      effectiveness_score: 0.8,
    });

    if (error) throw error;
  } catch (error) {
    console.error("Error saving content snippet:", error);
  }
}

// Get snippets by category
export async function getContentSnippets(
  category: string
): Promise<ContentSnippet[]> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (!userId) return [];

    const { data, error } = await supabase
      .from("content_snippets")
      .select("*")
      .eq("user_id", userId)
      .eq("category", category)
      .order("effectiveness_score", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching content snippets:", error);
    return [];
  }
}

// Build AI memory context for prompt
export async function buildMemoryContext(
  clientName: string,
  contractType: string
): Promise<string | null> {
  if (!clientName) return null;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (!userId) return null;

    const { data: preference, error } = await supabase
      .from("client_preferences")
      .select("*")
      .eq("user_id", userId)
      .eq("client_name", clientName)
      .single();

    if (error || !preference) {
      return null;
    }

    let context = "";

    if (preference.tone) {
      context += `\n- Writing Tone: Use a ${preference.tone} tone throughout the contract`;
    }

    if (preference.preferred_style) {
      if (preference.preferred_style === "detailed") {
        context += `\n- Style: This client prefers detailed, comprehensive clauses with thorough explanations`;
      } else if (preference.preferred_style === "concise") {
        context += `\n- Style: This client prefers concise, straightforward language without unnecessary elaboration`;
      } else if (preference.preferred_style === "moderate") {
        context += `\n- Style: Use a balanced approach with moderate detail levels`;
      }
    }

    if (preference.industry) {
      context += `\n- Industry Context: Client is in the ${preference.industry} industry`;
    }

    if (preference.key_terms && preference.key_terms.length > 0) {
      context += `\n- Preferred Terms: Consistently use these terms: ${preference.key_terms.join(", ")}`;
    }

    return context || null;
  } catch (error) {
    console.error("Error building memory context:", error);
    return null;
  }
}

// Log memory extraction
export async function logMemoryExtraction(
  contractId: string,
  extractionType: string,
  extractedData: Record<string, any>
): Promise<void> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (!userId) return;

    await supabase.from("ai_memory_logs").insert({
      user_id: userId,
      contract_id: contractId,
      extraction_type: extractionType,
      extracted_data: extractedData,
    });
  } catch (error) {
    console.error("Error logging memory extraction:", error);
  }
}

// Delete client preference
export async function deleteClientPreference(clientName: string): Promise<void> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (!userId) return;

    const { error } = await supabase
      .from("client_preferences")
      .delete()
      .eq("user_id", userId)
      .eq("client_name", clientName);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting client preference:", error);
  }
}