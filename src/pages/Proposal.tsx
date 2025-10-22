import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileText } from "lucide-react";

interface Contract {
  id: string;
  type: string;
  content: string;
  client_name?: string;
  project_title?: string;
  created_at: string;
  created_by?: string;
}

export default function Proposal() {
  const [searchParams] = useSearchParams();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const contractId = searchParams.get("id");
  const showBadge = searchParams.get("show_badge") !== "false";

  useEffect(() => {
    const loadContract = async () => {
      if (!contractId) {
        setError("No contract ID provided");
        setLoading(false);
        return;
      }

      try {
        const { data, error: err } = await supabase
          .from("contracts")
          .select("*")
          .eq("id", contractId)
          .single();

        if (err) {
          setError("Contract not found");
        } else {
          setContract(data);
        }
      } catch (err) {
        setError("Failed to load contract");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadContract();
  }, [contractId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading proposal...</p>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Contract Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {error || "This proposal could not be loaded"}
          </p>
          <Button
            onClick={() => window.location.href = "/"}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const handleDownloadPDF = () => {
    // Basic PDF download - would integrate with jsPDF in full implementation
    const element = document.getElementById("proposal-content");
    if (element) {
      const text = element.innerText;
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${contract.project_title || "contract"}.txt`;
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {contract.project_title || "Contract Proposal"}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {contract.type} • {new Date(contract.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Button
            onClick={handleDownloadPDF}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div
          id="proposal-content"
          className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 border border-slate-200 dark:border-slate-700"
        >
          <div className="prose dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 font-mono text-sm leading-relaxed">
              {contract.content}
            </div>
          </div>
        </div>

        {/* Footer Badge */}
        {showBadge && (
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Generated by <span className="font-semibold">ProposalFast</span> •{" "}
              <a
                href="/"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Create your own proposal
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
