import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface ContractRequest {
  contractType: string;
  clientName: string;
  freelancerName: string;
  projectScope: string;
  budget: string;
  timeline: string;
  useMemory?: boolean;
}

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

function generateMockContract(
  contractType: string,
  clientName: string,
  freelancerName: string,
  projectScope: string,
  budget: string,
  timeline: string
): string {
  const date = new Date().toLocaleDateString();
  return `
SERVICE AGREEMENT
Dated: ${date}

PARTIES:
This Service Agreement ("Agreement") is entered into between ${clientName} ("Client") and ${freelancerName} ("Service Provider").

SCOPE OF WORK:
${projectScope}

PAYMENT TERMS:
Client agrees to pay Service Provider a total fee of ${budget} for the services described above. Payment terms are net 30 days from invoice date.

TIMELINE:
The project timeline is estimated at ${timeline}.

DELIVERABLES:
Service Provider will deliver all work according to the timeline specified above.

CONFIDENTIALITY:
Both parties agree to keep all confidential information private during and after the engagement.

INTELLECTUAL PROPERTY:
All work product created under this Agreement shall be the property of the Client upon full payment.

TERMINATION:
Either party may terminate this Agreement with 14 days written notice.

GOVERNING LAW:
This Agreement shall be governed by applicable local law.

SIGNATURES:

Client: ____________________________  Date: __________

Service Provider: ____________________________  Date: __________
`;
}

async function generateContractWithAI(req: ContractRequest): Promise<string> {
  const { contractType, clientName, freelancerName, projectScope, budget, timeline, useMemory } = req;

  let prompt = `Generate a professional ${contractType} contract between:
- Client: ${clientName}
- Freelancer: ${freelancerName}

Project Details:
- Scope: ${projectScope}
- Budget: ${budget}
- Timeline: ${timeline}`;

  if (useMemory) {
    prompt += `\n\nNote: If available, apply this client's preferred tone, style, and terminology from previous contracts.`;
  }

  prompt += `\n\nPlease generate a comprehensive, legally-sound contract in a clear format.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4-turbo",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("OpenAI API error:", error);
    throw new Error(`OpenAI API error: ${error.error?.message || "Unknown error"}`);
  }

  const data = await response.json();
  const choice = data.choices[0];
  
  if (!choice.message?.content) {
    throw new Error("Unexpected response format from OpenAI");
  }

  return choice.message.content;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    const body: ContractRequest = await req.json();

    // Validate input
    if (!body.contractType || !body.clientName || !body.freelancerName || !body.projectScope || !body.budget || !body.timeline) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let contract: string;

    if (OPENAI_API_KEY) {
      try {
        console.log("Using OpenAI API to generate contract...");
        contract = await generateContractWithAI(body);
      } catch (error) {
        console.error("AI generation failed, using mock:", error);
        contract = generateMockContract(
          body.contractType,
          body.clientName,
          body.freelancerName,
          body.projectScope,
          body.budget,
          body.timeline
        );
      }
    } else {
      console.log("OpenAI API key not configured, using mock contract");
      contract = generateMockContract(
        body.contractType,
        body.clientName,
        body.freelancerName,
        body.projectScope,
        body.budget,
        body.timeline
      );
    }

    return new Response(
      JSON.stringify({ contract }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Contract generation error:", errorMsg);

    return new Response(
      JSON.stringify({ error: errorMsg }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});