import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Try to load OpenAI, but don't fail if it's not available
let openai = null;
try {
  const OpenAI = (await import("openai")).default;
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch (e) {
  console.warn("OpenAI not available, using mock mode");
}

// Mock contract generator for testing
const generateMockContract = (contractType, clientName, freelancerName, projectScope, budget, timeline) => {
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
};

app.post("/api/generate-contract", async (req, res) => {
  try {
    const { contractType, clientName, freelancerName, projectScope, budget, timeline } = req.body;

    if (!contractType || !clientName || !freelancerName || !projectScope || !budget || !timeline) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let contract;

    if (openai && process.env.OPENAI_API_KEY) {
      console.log("Using OpenAI API...");
      const prompt = `Generate a professional ${contractType} contract between:
- Client: ${clientName}
- Freelancer: ${freelancerName}

Project Details:
- Scope: ${projectScope}
- Budget: ${budget}
- Timeline: ${timeline}

Please generate a comprehensive, legally-sound contract.`;

      const message = await openai.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      });

      const content = message.content[0];
      if (content.type !== "text") {
        return res.status(500).json({ error: "Unexpected response type" });
      }
      contract = content.text;
    } else {
      console.log("Using mock contract generator (OpenAI API not configured)");
      contract = generateMockContract(contractType, clientName, freelancerName, projectScope, budget, timeline);
    }

    res.json({ contract });
  } catch (error) {
    console.error("Error generating contract:", error);
    // ALWAYS return valid JSON, even on error
    res.status(500).json({
      error: error?.message || "Failed to generate contract",
      fallback: "Using mock contract generator...",
      contract: generateMockContract("service", "Client", "Freelancer", "Project work", "$0", "TBD"),
    });
  }
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.OPENAI_API_KEY,
    mode: process.env.OPENAI_API_KEY ? "OpenAI" : "Mock",
  });
});

app.post("/api/send-to-signwell", async (req, res) => {
  try {
    const { contractText, recipients, contractName } = req.body;

    if (!contractText || !recipients || recipients.length === 0 || !contractName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const apiKey = process.env.SIGNWELL_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "SignWell API key not configured" });
    }

    // Create SignWell document
    const documentData = new FormData();
    documentData.append("file_name", `${contractName}.txt`);
    documentData.append("file_content", contractText);

    console.log("Creating SignWell document...");
    const documentResponse = await fetch("https://www.signwell.com/api/v1/documents/", {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
      },
      body: documentData,
    });

    if (!documentResponse.ok) {
      const error = await documentResponse.json();
      throw new Error(`SignWell error: ${error.detail || "Failed to create document"}`);
    }

    const document = await documentResponse.json();
    const documentId = document.id;

    // Add signers to the document
    console.log("Adding signers...");
    for (const recipient of recipients) {
      const signerResponse = await fetch(`https://www.signwell.com/api/v1/documents/${documentId}/signers/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: recipient.email,
          name: recipient.name,
          order: recipients.indexOf(recipient) + 1,
        }),
      });

      if (!signerResponse.ok) {
        throw new Error(`Failed to add signer: ${recipient.email}`);
      }
    }

    // Create signing request (send out for signing)
    console.log("Creating signing request...");
    const requestResponse = await fetch(`https://www.signwell.com/api/v1/documents/${documentId}/create_signing_request/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!requestResponse.ok) {
      const error = await requestResponse.json();
      throw new Error(`Failed to create signing request: ${error.detail}`);
    }

    const request = await requestResponse.json();

    res.json({
      success: true,
      documentId: document.id,
      signingUrl: request.signing_url || `https://www.signwell.com/documents/${documentId}/`,
      message: "Contract sent to SignWell for signing",
    });
  } catch (error) {
    console.error("Error sending to SignWell:", error);
    res.status(500).json({ error: error.message || "Failed to send to SignWell" });
  }
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✓ API server running on port ${PORT}`);
  console.log(`✓ Mode: ${process.env.OPENAI_API_KEY ? "OpenAI" : "Mock (for testing)"}`);
});