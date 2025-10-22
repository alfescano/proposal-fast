import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

interface ExtractMemoryRequest {
  contractContent: string;
  clientName: string;
  contractType: string;
}

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

async function extractPreferencesFromContract(contractContent: string, clientName: string, contractType: string): Promise<any> {
  const prompt = `Analyze this contract and extract the client's writing preferences and patterns:

CONTRACT:
${contractContent.substring(0, 2000)}

Please extract and return ONLY valid JSON (no markdown, no code blocks) with:
{
  "tone": "formal|casual|balanced" (most prominent tone),
  "industry": "name of industry if detectable, else null",
  "preferredStyle": "detailed|concise|moderate" (level of detail in clauses),
  "keyTerms": ["term1", "term2"] (up to 3 unique/important terms),
  "contractCount": 1
}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  // Clean response - remove markdown code blocks if present
  let cleanedContent = content.trim();
  if (cleanedContent.startsWith("```")) {
    cleanedContent = cleanedContent.replace(/```json\n?|\```/g, "").trim();
  }

  return JSON.parse(cleanedContent);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body: ExtractMemoryRequest = await req.json();
    const { contractContent, clientName, contractType } = body;

    if (!contractContent || !clientName || !contractType) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Extract preferences
    let preferences = {
      tone: null,
      industry: null,
      preferredStyle: null,
      keyTerms: [],
    };

    if (OPENAI_API_KEY) {
      try {
        preferences = await extractPreferencesFromContract(contractContent, clientName, contractType);
      } catch (error) {
        console.error("Error extracting preferences:", error);
        // Continue with default preferences
      }
    }

    // Check if client preferences already exist
    const { data: existing, error: queryError } = await supabase
      .from("client_preferences")
      .select("*")
      .eq("user_id", user.id)
      .eq("client_name", clientName)
      .single();

    let result;
    if (!existing && !queryError) {
      // Create new preference record
      const { data, error } = await supabase
        .from("client_preferences")
        .insert([
          {
            user_id: user.id,
            client_name: clientName,
            tone: preferences.tone,
            industry: preferences.industry,
            preferred_style: preferences.preferredStyle,
            key_terms: preferences.keyTerms,
            contract_count: 1,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else if (existing) {
      // Update existing preference record - increment count
      const { data, error } = await supabase
        .from("client_preferences")
        .update({
          tone: preferences.tone || existing.tone,
          industry: preferences.industry || existing.industry,
          preferred_style: preferences.preferredStyle || existing.preferred_style,
          key_terms: preferences.keyTerms || existing.key_terms,
          contract_count: (existing.contract_count || 1) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("client_name", clientName)
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Memory extraction error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});