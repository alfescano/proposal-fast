import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProposalActions } from "@/components/ProposalActions";
import { useCRMSync } from "@/hooks/useCRMSync";
import { Download, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface ProposalPageExampleProps {
  proposalId: string;
  proposalData?: {
    title: string;
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    clientCompany?: string;
    amount: number;
    content: string;
    createdAt: Date;
  };
}

/**
 * Example Proposal Page Component
 * Demonstrates integration of CRM and Calendar features
 * 
 * Features:
 * - Auto-sync proposal to CRM on load
 * - Display booking button for clients
 * - E-signature integration
 * - PDF export
 */
export function ProposalPageExample({
  proposalId,
  proposalData,
}: ProposalPageExampleProps) {
  const { userId } = useAuth();
  const { syncProposal, markAsSigned, syncing } = useCRMSync();
  const [signed, setSigned] = useState(false);
  const [crmSynced, setCrmSynced] = useState(false);

  // Auto-sync to CRM on page load
  useEffect(() => {
    if (!proposalData || crmSynced) return;

    const syncToCRM = async () => {
      const result = await syncProposal({
        proposalId,
        clientEmail: proposalData.clientEmail,
        clientName: proposalData.clientName,
        clientPhone: proposalData.clientPhone,
        clientCompany: proposalData.clientCompany,
        dealAmount: proposalData.amount,
      });

      if (result) {
        setCrmSynced(true);
        console.log("Proposal synced to CRM");
      }
    };

    syncToCRM();
  }, [proposalData, proposalId, crmSynced, syncProposal]);

  const handleSignProposal = async () => {
    try {
      // Call SignWell API to send for e-signature
      // This is a placeholder - integrate with your actual signing flow
      
      setSigned(true);
      
      // Mark deal as won in CRM
      await markAsSigned(proposalId);
      
      toast.success("Proposal sent for signature!");
    } catch (error) {
      console.error("Error signing proposal:", error);
      toast.error("Failed to send proposal");
    }
  };

  const handleDownloadPDF = () => {
    // Implement PDF download using html2pdf or jsPDF
    toast.success("Downloading PDF...");
  };

  if (!proposalData) {
    return <div>Loading proposal...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{proposalData.title}</h1>
        <p className="text-muted-foreground">
          Proposal for {proposalData.clientName} • ${proposalData.amount.toLocaleString()}
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Proposal</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        {/* Proposal Content Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Proposal Details</CardTitle>
              <CardDescription>
                Created on {proposalData.createdAt.toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Client Name</p>
                  <p className="text-muted-foreground">{proposalData.clientName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-muted-foreground">{proposalData.clientEmail}</p>
                </div>
                {proposalData.clientPhone && (
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-muted-foreground">{proposalData.clientPhone}</p>
                  </div>
                )}
                {proposalData.clientCompany && (
                  <div>
                    <p className="text-sm font-medium">Company</p>
                    <p className="text-muted-foreground">{proposalData.clientCompany}</p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Proposal Content</p>
                <div className="bg-muted p-4 rounded-lg prose prose-sm max-w-none">
                  {proposalData.content}
                </div>
              </div>

              {crmSynced && (
                <div className="flex gap-2 items-center text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                  Deal synced to HubSpot
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-4">
          {/* Next Steps */}
          <ProposalActions
            clientName={proposalData.clientName}
            clientEmail={proposalData.clientEmail}
            proposalTitle={proposalData.title}
          />

          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Send & Download</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleSignProposal}
                disabled={syncing || signed}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {signed ? "Sent for Signature" : "Send for E-Signature"}
              </Button>

              <Button
                onClick={handleDownloadPDF}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download as PDF
              </Button>
            </CardContent>
          </Card>

          {/* Integration Status */}
          <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-base">Integration Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span>CRM Sync</span>
                {crmSynced ? (
                  <span className="text-green-600 font-medium">✓ Active</span>
                ) : (
                  <span className="text-amber-600 font-medium">Pending</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span>Calendar Booking</span>
                <span className="text-cyan-600 font-medium">✓ Ready</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProposalPageExample;
