import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowLeft, Trash2, LogOut, Brain, TrendingUp } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useClerk } from "@clerk/clerk-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface ClientPreference {
  id: string;
  client_name: string;
  tone?: string;
  industry?: string;
  preferred_style?: string;
  key_terms?: string[];
  contract_count: number;
  updated_at: string;
}

export default function MemoryCenter() {
  const { user: userProfile } = useAuthContext();
  const { signOut } = useClerk();
  const [preferences, setPreferences] = useState<ClientPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalContracts: 0,
    industries: new Set<string>(),
  });

  useEffect(() => {
    loadPreferences();
  }, [userProfile?.id]);

  const loadPreferences = async () => {
    if (!userProfile?.id) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("client_preferences")
        .select("*")
        .eq("user_id", userProfile.id)
        .order("contract_count", { ascending: false });

      if (error) {
        console.error("Error loading preferences:", error);
        toast.error("Failed to load client memory");
        setPreferences([]);
      } else {
        const prefs = (data || []) as ClientPreference[];
        setPreferences(prefs);

        // Calculate stats
        const industries = new Set<string>();
        let totalContracts = 0;

        prefs.forEach((p) => {
          if (p.industry) industries.add(p.industry);
          totalContracts += p.contract_count || 1;
        });

        setStats({
          totalClients: prefs.length,
          totalContracts,
          industries,
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const deleteClientMemory = async (id: string, clientName: string) => {
    try {
      const { error } = await supabase
        .from("client_preferences")
        .delete()
        .eq("id", id)
        .eq("user_id", userProfile?.id);

      if (error) throw error;
      setPreferences(preferences.filter((p) => p.id !== id));
      toast.success(`Cleared memory for ${clientName}`);
      await loadPreferences();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete client memory");
    }
  };

  const getToneColor = (tone?: string) => {
    switch (tone) {
      case "formal":
        return "bg-blue-900/50 border-blue-400";
      case "casual":
        return "bg-green-900/50 border-green-400";
      case "balanced":
        return "bg-purple-900/50 border-purple-400";
      default:
        return "bg-slate-700/50 border-slate-400";
    }
  };

  const getStyleIcon = (style?: string) => {
    switch (style) {
      case "detailed":
        return "📋";
      case "concise":
        return "📝";
      case "moderate":
        return "📄";
      default:
        return "📃";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-8 pt-4">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon" className="hover:bg-slate-800">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Brain className="w-8 h-8 text-purple-400" />
                AI Memory Center
              </h1>
              <p className="text-sm text-slate-400">Manage learned client preferences and patterns</p>
            </div>
          </div>
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

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-purple-500/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Clients Learned</p>
                <p className="text-3xl font-bold text-purple-300">{stats.totalClients}</p>
              </div>
              <Brain className="w-12 h-12 text-purple-400/30" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-blue-500/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Contracts Analyzed</p>
                <p className="text-3xl font-bold text-blue-300">{stats.totalContracts}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-blue-400/30" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Industries Detected</p>
                <p className="text-3xl font-bold text-green-300">{stats.industries.size}</p>
              </div>
              <p className="text-2xl">🏢</p>
            </div>
          </Card>
        </div>

        {/* Preferences List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading client memory...</p>
          </div>
        ) : preferences.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700/50 p-12 text-center">
            <Brain className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Client Memory Yet</h2>
            <p className="text-slate-400 mb-6">
              Generate contracts and enable "Use AI Memory" to start learning client preferences.
            </p>
            <Link to="/generator">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Generate a Contract
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Learned Clients</h2>
            {preferences.map((pref) => (
              <Card
                key={pref.id}
                className="bg-slate-800/50 border-slate-700/50 p-6 hover:bg-slate-800/70 transition"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-3">{pref.client_name}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {pref.tone && (
                        <Badge
                          variant="outline"
                          className={`${getToneColor(pref.tone)} text-white capitalize`}
                        >
                          {pref.tone} Tone
                        </Badge>
                      )}
                      {pref.industry && (
                        <Badge variant="outline" className="bg-amber-900/50 border-amber-400 text-white">
                          {pref.industry}
                        </Badge>
                      )}
                      {pref.preferred_style && (
                        <Badge variant="outline" className="bg-slate-700/50 border-slate-400 text-white">
                          {getStyleIcon(pref.preferred_style)} {pref.preferred_style}
                        </Badge>
                      )}
                    </div>

                    {pref.key_terms && pref.key_terms.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-slate-400 mb-2">Key Terms:</p>
                        <div className="flex flex-wrap gap-1">
                          {pref.key_terms.map((term, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="bg-slate-700/50 text-slate-200 text-xs"
                            >
                              {term}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-slate-400">
                      {pref.contract_count} contract{pref.contract_count !== 1 ? "s" : ""} analyzed •{" "}
                      Last updated {new Date(pref.updated_at).toLocaleDateString()}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-600/50 hover:bg-red-900/20 text-red-400 flex-shrink-0"
                    onClick={() => deleteClientMemory(pref.id, pref.client_name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Info Box */}
        <Card className="bg-blue-900/20 border-blue-500/50 p-6 mt-8">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <span className="text-lg">ℹ️</span> How AI Memory Works
          </h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>• Enable "Use AI Memory" when generating contracts to learn from this client's previous contracts</li>
            <li>• The AI analyzes tone, style, terminology, and industry patterns from each contract</li>
            <li>• Future contracts for the same client automatically apply learned preferences</li>
            <li>• You can delete client memories to clear learned preferences at any time</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}