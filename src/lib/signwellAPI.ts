export interface SignWellRecipient {
  email: string;
  name: string;
  role?: string;
}

export interface SendToSignWellRequest {
  contractText: string;
  recipients: SignWellRecipient[];
  contractName: string;
}

export async function sendToSignWell(data: SendToSignWellRequest) {
  try {
    const response = await fetch("/api/send-to-signwell", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to send to SignWell");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}
