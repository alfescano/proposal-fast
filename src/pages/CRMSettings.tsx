import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { getUserHubSpotSettings, updateHubSpotSettings } from "@/lib/hubspotAPI";

export default function CRMSettings() {
  const { userId } = useAuth();
  const [apiKey, setApiKey] = useState("");
  const [pipelineId, setPipelineId] = useState("");
  const [autoSync, setAutoSync] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const loadSettings = async () => {
      const settings = await getUserHubSpotSettings(userId);
      if (settings) {
        setApiKey(settings.api_key ? "••••••••" : "");
        setPipelineId(settings.pipeline_id || "");
        setAutoSync(settings.auto_sync_enabled ?? true);
        setConnected(!!settings.api_key);
      }
      setInitializing(false);
    };

    loadSettings();
  }, [userId]);

  const handleConnect = async () => {
    if (!apiKey || !pipelineId) {
      toast.error("Please enter both API key and Pipeline ID");
      return;
    }

    setLoading(true);
    const result = await updateHubSpotSettings(userId!, apiKey, pipelineId);
    setLoading(false);

    if (result) {
      setConnected(true);
      toast.success("HubSpot connected successfully!");
    }
  };

  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CRM Integration</h1>
          <p className="text-muted-foreground mt-2">
            Connect your HubSpot account to automatically sync proposals and deals
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>HubSpot Connection</CardTitle>
            <CardDescription>
              {connected
                ? "Your HubSpot account is connected. Proposals will automatically sync as deals."
                : "Connect your HubSpot account to enable CRM integration"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {connected && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  ✓ HubSpot account is connected and active
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="api-key">HubSpot API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your HubSpot private app token"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={connected}
              />
              <p className="text-xs text-muted-foreground">
                Get your API key from HubSpot Settings → Integrations → Private Apps
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pipeline-id">Deal Pipeline ID</Label>
              <Input
                id="pipeline-id"
                placeholder="e.g., 0"
                value={pipelineId}
                onChange={(e) => setPipelineId(e.target.value)}
                disabled={connected}
              />
              <p className="text-xs text-muted-foreground">
                Your HubSpot pipeline ID (usually "0" for the default pipeline)
              </p>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Auto-sync Proposals</p>
                <p className="text-sm text-muted-foreground">
                  Automatically create deals when proposals are generated
                </p>
              </div>
              <Switch checked={autoSync === true} onCheckedChange={setAutoSync} disabled={!connected} />
            </div>

            {!connected && (
              <Button onClick={handleConnect} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect HubSpot"
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="font-bold text-primary">1.</span>
                <span>When you create a proposal, a new deal is automatically created in HubSpot</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">2.</span>
                <span>Client contact information is synced to HubSpot</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">3.</span>
                <span>When the proposal is signed, the deal is marked as "Won"</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}