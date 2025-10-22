import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader, Download, ArrowLeft, Send, Plus, Trash2, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { generateMockContract } from "@/lib/mockContractGenerator";
import { sendToSignWell } from "@/lib/signwellAPI";
import { useAuthContext } from "@/contexts/AuthContext";
import { useClerk } from "@clerk/clerk-react";
import { supabase } from "@/lib/supabase";
import { sendTransactionalEmail } from "@/lib/emailService";
import { events, updateFunnelStage } from "@/lib/analytics";
import { MemorySuggestion } from "@/components/MemorySuggestion";
import { extractAndSaveMemory } from "@/lib/generateContract";
import { useBrandKit } from "@/hooks/useBrandKit";
import { generatePDFWithBrandKit, applyBrandKitToElement, createBrandedHeader, createBrandedFooter } from "@/lib/pdfWithBrandKit";

export default function Generator() {
  const { user: userProfile } = useAuthContext();
  const { signOut } = useClerk();
  const { brandKit } = useBrandKit();
  const [contractType, setContractType] = useState("");
  const [clientName, setClientName] = useState("");
  const [freelancerName, setFreelancerName] = useState(userProfile?.name || "");
  const [projectScope, setProjectScope] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState("");
  const [useMemory, setUseMemory] = useState(false);
  const [showSignWellModal, setShowSignWellModal] = useState(false);
  const [signingLoading, setSigningLoading] = useState(false);
  const [recipients, setRecipients] = useState<Array<{ email: string; name: string }>>([
    { email: userProfile?.email || "", name: "" },
  ]);

  useEffect(() => {
    events.pageView("generator");
    if (userProfile?.id) {
      updateFunnelStage(userProfile.id, "generator");
    }
  }, [userProfile?.id]);
  const generateContract = async () => {
    if (!contractType || !clientName || !freelancerName || !projectScope || !budget || !timeline) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-contract`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            contractType,
            clientName,
            freelancerName,
            projectScope,
            budget,
            timeline,
            useMemory,
          }),
        }
      );

      let contractText = "";

      if (response.ok) {
        const data = await response.json();
        contractText = data.contract;
        toast.success("Contract generated with AI!");
      } else {
        contractText = generateMockContract(
          contractType,
          clientName,
          freelancerName,
          projectScope,
          budget,
          timeline
        );
        toast.info("Using template (API offline)");
      }

      setContract(contractText);
      events.contractGenerated(contractType, budget);

      if (userProfile?.id) {
        await saveContractToSupabase(contractText);
        if (useMemory) {
          await extractAndSaveMemory(contractText, clientName, contractType);
        }
      }
    } catch (error) {
      console.error("Generation error:", error);
      const contractText = generateMockContract(
        contractType,
        clientName,
        freelancerName,
        projectScope,
        budget,
        timeline
      );
      setContract(contractText);
      toast.info("Using template (API offline)");
      events.contractGenerated(contractType, budget);

      if (userProfile?.id) {
        await saveContractToSupabase(contractText);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveContractToSupabase = async (contractText: string) => {
    if (!supabase) {
      console.warn("Supabase not configured, skipping save");
      return;
    }
    try {
      const { data, error } = await supabase
        .from("contracts")
        .insert([
          {
            user_id: userProfile?.id,
            contract_type: contractType,
            client_name: clientName,
            freelancer_name: freelancerName,
            project_scope: projectScope,
            budget,
            timeline,
            contract_text: contractText,
            status: "draft",
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error saving contract:", error);
      } else {
        console.log("Contract saved to Supabase");

        try {
          await sendTransactionalEmail({
            to: userProfile?.email || "",
            emailType: "contract_generated",
            userId: userProfile?.id || "",
            contractId: data?.id,
            data: {
              freelancerName: freelancerName || "Freelancer",
              clientName,
              contractType,
            },
          });
        } catch (emailError) {
          console.error("Error sending email:", emailError);
        }
      }
    } catch (error) {
      console.error("Error saving contract:", error);
    }
  };

  const downloadPDF = async () => {
    if (!contract) return;
    try {
      await generatePDFWithBrandKit({
        filename: `${clientName}-contract.pdf`,
        title: `${contractType} Contract`,
        content: contract,
        brandKit,
        clientName,
        contractType,
      });
      events.pdfDownloaded(contractType);
      toast.success("Contract downloaded with branding!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Error downloading PDF");
    }
  };

  const handleSendToSignWell = async () => {
    const validRecipients = recipients.filter((r) => r.email && r.name);

    if (validRecipients.length === 0) {
      toast.error("Please add at least one recipient with email and name");
      return;
    }

    setSigningLoading(true);
    try {
      const result = await sendToSignWell({
        contractText: contract,
        recipients: validRecipients,
        contractName: `${contractType}-${clientName}`,
      });

      events.signwellSent(validRecipients.length);
      toast.success("Contract sent to SignWell!");
      console.log("Signing URL:", result.signingUrl);

      try {
        for (const recipient of validRecipients) {
          await sendTransactionalEmail({
            to: recipient.email,
            emailType: "signing_invitation",
            userId: userProfile?.id || "",
            data: {
              recipientName: recipient.name,
              senderName: freelancerName || "Your Client",
              contractType,
              signingLink: result.signingUrl || "#",
            },
          });
        }
        toast.success("Signing invitations sent!");
      } catch (emailError) {
        console.error("Error sending invitations:", emailError);
        toast.error("Contract sent but email invitations failed");
      }
      if (result.signingUrl) {
        navigator.clipboard.writeText(result.signingUrl);
        toast.success("Signing link copied to clipboard!");
      }

      setShowSignWellModal(false);
      setRecipients([{ email: userProfile?.email || "", name: "" }]);
    } catch (error) {
      console.error("SignWell error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send to SignWell");
    } finally {
      setSigningLoading(false);
    }
  };

  const addRecipient = () => {
    setRecipients([...recipients, { email: "", name: "" }]);
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const updateRecipient = (index: number, field: "email" | "name", value: string) => {
    const updated = [...recipients];
    updated[index][field] = value;
    setRecipients(updated);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-8 pt-4">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" className="hover:bg-slate-800">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Contract Generator</h1>
          </div>
          <div className="flex items-center gap-4">
            {userProfile && (
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <span>{userProfile.name || userProfile.email}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => signOut()}
                  className="hover:bg-slate-800"
                  aria-label="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <MemorySuggestion clientName={clientName} />
            
            <Card className="bg-slate-800/50 border-slate-700/50 p-6 space-y-4">
              <h2 className="text-xl font-semibold mb-6">Contract Details</h2>

              <div>
                <Label className="text-slate-300">Contract Type</Label>
              <Select value={contractType} onValueChange={setContractType}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Select contract type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="service">Service Agreement</SelectItem>
                  <SelectItem value="nda">Non-Disclosure Agreement</SelectItem>
                  <SelectItem value="development">Development Contract</SelectItem>
                  <SelectItem value="design">Design Contract</SelectItem>
                  <SelectItem value="content">Content Creation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-300">Client Name</Label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white"
                placeholder="e.g., Acme Corp"
              />
            </div>

            <div>
              <Label className="text-slate-300">Your Name</Label>
              <Input
                value={freelancerName}
                onChange={(e) => setFreelancerName(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white"
                placeholder="Your name"
              />
            </div>

            <div>
              <Label className="text-slate-300">Project Scope</Label>
              <Textarea
                value={projectScope}
                onChange={(e) => setProjectScope(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white"
                placeholder="Describe the project scope..."
                rows={3}
              />
            </div>

            <div>
              <Label className="text-slate-300">Budget</Label>
              <Input
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white"
                placeholder="e.g., $5,000"
              />
            </div>

              <div>
                <Label className="text-slate-300">Timeline</Label>
                <Input
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                  placeholder="e.g., 4 weeks"
                />
              </div>

              <div className="flex items-center space-x-2 p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
                <Checkbox
                  id="use-memory"
                  checked={useMemory}
                  onCheckedChange={(checked) => setUseMemory(checked as boolean)}
                  className="border-purple-400"
                />
                <label htmlFor="use-memory" className="text-sm text-slate-300 cursor-pointer">
                  Use AI Memory (apply client preferences)
                </label>
              </div>

              <Button
                onClick={generateContract}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Contract"
                )}
              </Button>
            </Card>
          </div>

          <div>
            <Card className="bg-slate-800/50 border-slate-700/50 p-6 sticky top-4 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Preview</h2>
                {brandKit?.logo_url && (
                  <img
                    src={brandKit.logo_url}
                    alt="Brand Logo"
                    className="h-8 object-contain"
                  />
                )}
              </div>
              <div
                id="contract-preview"
                className="p-6 rounded-lg max-h-96 overflow-y-auto text-sm space-y-3 mb-4"
                style={{
                  backgroundColor: brandKit?.secondary_color || "#ffffff",
                  color: brandKit?.primary_color || "#000000",
                  fontFamily: brandKit?.font_family || "inter",
                  borderColor: brandKit?.accent_color || "#3b82f6",
                  borderWidth: "1px",
                }}
              >
                {contract ? (
                  <div className="whitespace-pre-wrap">{contract}</div>
                ) : (
                  <p className="text-slate-500 text-center py-12">Contract preview will appear here</p>
                )}
              </div>

              {contract && (
                <Button onClick={downloadPDF} className="w-full bg-green-600 hover:bg-green-700">
                  <Download className="w-4 h-4 mr-2" />
                  Download as PDF
                </Button>
              )}

              {contract && (
                <Button
                  onClick={() => setShowSignWellModal(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700 mt-2"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send to SignWell for Signing
                </Button>
              )}
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showSignWellModal} onOpenChange={setShowSignWellModal}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Send to SignWell for E-Signing</DialogTitle>
            <DialogDescription className="text-slate-400">
              Add recipients who need to sign this contract
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {recipients.map((recipient, index) => (
              <div key={index} className="space-y-2 p-3 bg-slate-700/50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-slate-300">Recipient {index + 1}</Label>
                  {recipients.length > 1 && (
                    <button
                      onClick={() => removeRecipient(index)}
                      className="p-1 hover:bg-slate-600 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  )}
                </div>
                <Input
                  type="email"
                  placeholder="Email address"
                  value={recipient.email}
                  onChange={(e) => updateRecipient(index, "email", e.target.value)}
                  className="bg-slate-600 border-slate-500 text-white"
                />
                <Input
                  placeholder="Full name"
                  value={recipient.name}
                  onChange={(e) => updateRecipient(index, "name", e.target.value)}
                  className="bg-slate-600 border-slate-500 text-white"
                />
              </div>
            ))}

            <Button
              onClick={addRecipient}
              variant="outline"
              className="w-full border-slate-600 hover:bg-slate-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Recipient
            </Button>

            <div className="flex gap-2">
              <Button
                onClick={() => setShowSignWellModal(false)}
                variant="outline"
                className="flex-1 border-slate-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendToSignWell}
                disabled={signingLoading}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {signingLoading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send to SignWell
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}