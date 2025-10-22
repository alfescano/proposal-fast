import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Download, LogOut, Plus, Trash2, Crown, Brain } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useClerk } from "@clerk/clerk-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { generatePDFWithBrandKit } from "@/lib/pdfWithBrandKit";
import { getBrandKit } from "@/lib/brandKitService";
import { getUserSubscription } from "@/lib/subscriptionUtils";
import type { UserSubscription } from "@/lib/subscriptionUtils";
import { events } from "@/lib/analytics";
import { BrandKitStatusCard } from "@/components/BrandKitStatusCard";

interface Contract {
  id: string;
  contract_type: string;
  client_name: string;
  freelancer_name: string;
  budget: string;
  status: string;
  created_at: string;
  contract_text: string;
}

export default function Dashboard() {
  const { user: userProfile } = useAuthContext();
  const { signOut } = useClerk();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [managingPortal, setManagingPortal] = useState(false);
  const [brandKit, setBrandKit] = useState<any>(null);

  useEffect(() => {
    events.pageView("dashboard");
    loadContracts();
    if (userProfile?.id) {
      loadBrandKit();
    }
  }, [userProfile?.id]);

  const loadBrandKit = async () => {
    if (!userProfile?.id) return;
    try {
      const kit = await getBrandKit(userProfile.id);
      setBrandKit(kit);
    } catch (error) {
      console.error("Error loading brand kit:", error);
    }
  };

  const loadContracts = async () => {
    if (!userProfile?.id) {
      setLoading(false);
      return;
    }

    try {
      if (!supabase) {
        console.warn("Supabase not configured");
        setContracts([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .eq("user_id", userProfile.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading contracts:", error);
        toast.error("Failed to load contracts");
        setContracts([]);
      } else {
        setContracts(data || []);
      }
      const sub = await getUserSubscription(userProfile.id);
      setSubscription(sub);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const deleteContract = async (id: string) => {
    if (!supabase) {
      toast.error("Database not configured");
      return;
    }
    try {
      const { error } = await supabase.from("contracts").delete().eq("id", id);
      if (error) throw error;
      setContracts(contracts.filter((c) => c.id !== id));
      toast.success("Contract deleted");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete contract");
    }
  };

  const downloadPDF = async (contract: Contract) => {
    try {
      await generatePDFWithBrandKit({
        filename: `${contract.client_name}-contract.pdf`,
        title: `${contract.contract_type} Contract`,
        content: contract.contract_text,
        brandKit,
        clientName: contract.client_name,
        contractType: contract.contract_type,
      });
      toast.success("Contract downloaded with branding!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Error downloading PDF");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-slate-500";
      case "sent":
        return "bg-blue-500";
      case "signed":
        return "bg-green-500";
      case "archived":
        return "bg-slate-600";
      default:
        return "bg-slate-500";
    }
  };

  const handleManageSubscription = async () => {
    if (!userProfile?.id) return;
    setManagingPortal(true);
    try {
      const { createPortalSession: createPortal } = await import("@/lib/stripe");
      const url = await createPortal(userProfile.id);
      window.location.href = url;
    } catch (error) {
      console.error("Portal error:", error);
      toast.error("Failed to open billing portal");
    } finally {
      setManagingPortal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-8 pt-4">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" className="hover:bg-slate-800">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">My Contracts</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/memory">
              <Button variant="outline" className="border-slate-600 hover:bg-slate-800">
                <Brain className="w-4 h-4 mr-2" />
                AI Memory
              </Button>
            </Link>
            <Link to="/analytics">
              <Button variant="outline" className="border-slate-600 hover:bg-slate-800">
                Analytics
              </Button>
            </Link>
            <Link to="/generator">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Contract
              </Button>
            </Link>
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

        {/* Status Cards Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <BrandKitStatusCard />
        </div>

        {/* Subscription Status */}
        {subscription && (
          <Card className="bg-slate-800/50 border-slate-700/50 p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className={`w-5 h-5 ${subscription.plan === "pro" ? "text-yellow-400" : "text-slate-400"}`} />
              <div>
                <p className="text-sm font-semibold">
                  Plan: <span className="capitalize">{subscription.plan}</span>
                </p>
                <p className="text-xs text-slate-400">
                  Status: {subscription.status}
                  {subscription.currentPeriodEnd && ` • Renews on ${subscription.currentPeriodEnd.toLocaleDateString()}`}
                </p>
              </div>
            </div>
            {subscription.plan !== "free" && (
              <Button
                size="sm"
                onClick={handleManageSubscription}
                disabled={managingPortal}
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                {managingPortal ? "Loading..." : "Manage"}
              </Button>
            )}
            {subscription.plan === "free" && (
              <Link to="/pricing">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Upgrade Now
                </Button>
              </Link>
            )}
          </Card>
        )}

        {/* Contracts List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading contracts...</p>
          </div>
        ) : contracts.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700/50 p-12 text-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No contracts yet</h2>
            <p className="text-slate-400 mb-6">
              Create your first contract to get started.
            </p>
            <Link to="/generator">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Contract
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4">
            {contracts.map((contract) => (
              <Card
                key={contract.id}
                className="bg-slate-800/50 border-slate-700/50 p-6 hover:bg-slate-800/70 transition"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold truncate">
                        {contract.client_name}
                      </h3>
                      <Badge className={`${getStatusColor(contract.status)} text-white`}>
                        {contract.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mb-2">
                      {contract.contract_type} • {contract.budget}
                    </p>
                    <p className="text-xs text-slate-500">
                      Created {new Date(contract.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-600 hover:bg-slate-700"
                      onClick={() => downloadPDF(contract)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-600/50 hover:bg-red-900/20 text-red-400"
                      onClick={() => deleteContract(contract.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}