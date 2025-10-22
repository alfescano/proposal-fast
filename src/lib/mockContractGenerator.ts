export function generateMockContract(
  contractType: string,
  clientName: string,
  freelancerName: string,
  projectScope: string,
  budget: string,
  timeline: string
): string {
  const date = new Date().toLocaleDateString();
  const contractTypeLabel = {
    service: "SERVICE AGREEMENT",
    nda: "NON-DISCLOSURE AGREEMENT",
    development: "SOFTWARE DEVELOPMENT AGREEMENT",
    design: "DESIGN SERVICES AGREEMENT",
    content: "CONTENT CREATION AGREEMENT",
  }[contractType] || "SERVICE AGREEMENT";

  return `
${contractTypeLabel}

Dated: ${date}

PARTIES:
This Agreement ("Agreement") is entered into between ${clientName} ("Client") and ${freelancerName} ("Service Provider").

SCOPE OF WORK:
${projectScope}

PAYMENT TERMS:
Client agrees to pay Service Provider a total fee of ${budget} for the services described above. Payment is due net 30 days from invoice date. A 50% deposit is required upon signature, with the balance due upon project completion.

PROJECT TIMELINE:
The estimated project timeline is ${timeline}. Service Provider will provide regular updates on project progress.

DELIVERABLES:
Service Provider will deliver all work according to the timeline and specifications outlined in this Agreement.

CONFIDENTIALITY:
Both parties agree to maintain the confidentiality of all proprietary and sensitive information shared during the term of this Agreement.

INTELLECTUAL PROPERTY RIGHTS:
All work product, including but not limited to designs, code, copy, and materials created under this Agreement shall be the exclusive property of the Client upon full payment. Service Provider retains the right to use work samples for portfolio purposes with Client approval.

WARRANTY:
Service Provider warrants that all work will be performed in a professional and timely manner, free from defects.

REVISION POLICY:
Client is entitled to ${contractType === "design" ? "two (2)" : "one (1)"} rounds of revisions. Additional revisions will be billed at $75 per hour.

TERMINATION:
Either party may terminate this Agreement with 14 days written notice. Upon termination, Client remains responsible for payment for all completed work.

LIABILITY:
In no event shall either party's liability exceed the total amount paid under this Agreement.

DISPUTE RESOLUTION:
Any disputes shall be resolved through mutual negotiation. If unresolved, disputes shall be handled through binding arbitration.

GOVERNING LAW:
This Agreement shall be governed by and construed in accordance with applicable law.

ENTIRE AGREEMENT:
This Agreement constitutes the entire agreement between the parties and supersedes all prior negotiations and understandings.

SIGNATURES:

CLIENT:

Name: ____________________________

Signature: ____________________________

Date: ____________________________


SERVICE PROVIDER:

Name: ____________________________

Signature: ____________________________

Date: ____________________________
`;
}
