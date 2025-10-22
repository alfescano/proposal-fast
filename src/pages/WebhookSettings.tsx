import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader, Zap, CheckCircle2, AlertCircle, Code2 } from "lucide-react";
import { toast } from "sonner";
import {
  getWebhookIntegration,
  updateWebhookIntegration,
  testWebhook,
  getWebhookHistory,
} from "@/lib/webhookService";

const WEBHOOK_EVENTS = [
  { id: "proposal.created", name: "Proposal Created", icon: "📄" },
  { id: "proposal.sent", name: "Proposal Sent", icon: "📤" },
  { id: "proposal.viewed", name: "Proposal Viewed", icon: "👁️" },
  { id: "proposal.signed", name: "Proposal Signed", icon: "✍️" },
  { id: "payment.completed", name: "Payment Completed", icon: "✅" },
  { id: "payment.failed", name: "Payment Failed", icon: "❌" },
  { id: "client.invited", name: "Client Invited", icon: "👤" },
];

export default function WebhookSettings() {
  const { userId } = useAuth();
  const [zapierUrl, setZapierUrl] = useState("");
  const [makeUrl, setMakeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;

    const loadSettings = async () => {
      const integration = await getWebhookIntegration(userId);
      if (integration) {
        setZapierUrl(integration.zapier_webhook_url || "");
        setMakeUrl(integration.make_webhook_url || "");
        setEnabled(integration.enabled);
      }

      const logs = await getWebhookHistory(userId);
      setHistory(logs);
      setInitializing(false);
    };

    loadSettings();
  }, [userId]);

  const handleSave = async () => {
    if (!zapierUrl && !makeUrl) {
      toast.error("Please enter at least one webhook URL");
      return;
    }

    setLoading(true);
    const result = await updateWebhookIntegration(userId!, zapierUrl || undefined, makeUrl || undefined);
    setLoading(false);

    if (result) {
      setEnabled(true);
      toast.success("Webhook settings saved!");
    }
  };

  const handleTestZapier = async () => {
    if (!zapierUrl) {
      toast.error("Please enter a Zapier webhook URL");
      return;
    }

    setLoading(true);
    const success = await testWebhook(userId!, zapierUrl, "zapier");
    setLoading(false);

    if (success) {
      const logs = await getWebhookHistory(userId!);
      setHistory(logs);
    }
  };

  const handleTestMake = async () => {
    if (!makeUrl) {
      toast.error("Please enter a Make webhook URL");
      return;
    }

    setLoading(true);
    const success = await testWebhook(userId!, makeUrl, "make");
    setLoading(false);

    if (success) {
      const logs = await getWebhookHistory(userId!);
      setHistory(logs);
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
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="w-8 h-8" />
            Workflow Automations
          </h1>
          <p className="text-muted-foreground mt-2">
            Connect to Zapier or Make.com to automate your proposal workflow
          </p>
        </div>

        {enabled && (zapierUrl || makeUrl) && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Webhooks are active and will trigger on proposal events
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Connect Your Automation Platform</CardTitle>
                <CardDescription>
                  Add webhook URLs from Zapier or Make.com to trigger automations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Zapier */}
                <div className="space-y-2">
                  <Label htmlFor="zapier-url" className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Zapier Webhook URL
                  </Label>
                  <Input
                    id="zapier-url"
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                    value={zapierUrl}
                    onChange={(e) => setZapierUrl(e.target.value)}
                    type="password"
                  />
                  <p className="text-xs text-muted-foreground">
                    Create a Zapier Zap with "Webhooks by Zapier" → "Catch Hook" and paste the URL here
                  </p>
                  <Button
                    onClick={handleTestZapier}
                    disabled={loading || !zapierUrl}
                    variant="outline"
                    size="sm"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-3 h-3 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      "Test Zapier Connection"
                    )}
                  </Button>
                </div>

                {/* Make.com */}
                <div className="space-y-2">
                  <Label htmlFor="make-url" className="flex items-center gap-2">
                    <Code2 className="w-4 h-4" />
                    Make.com Webhook URL
                  </Label>
                  <Input
                    id="make-url"
                    placeholder="https://hook.make.com/..."
                    value={makeUrl}
                    onChange={(e) => setMakeUrl(e.target.value)}
                    type="password"
                  />
                  <p className="text-xs text-muted-foreground">
                    Create a Make.com scenario with Webhooks module and paste the URL here
                  </p>
                  <Button
                    onClick={handleTestMake}
                    disabled={loading || !makeUrl}
                    variant="outline"
                    size="sm"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-3 h-3 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      "Test Make Connection"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={loading}
              size="lg"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Webhook Settings"
              )}
            </Button>

            {/* Integration Guide */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How to Get Your Webhook URL</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Zapier:</h4>
                  <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                    <li>Go to zapier.com and create a new Zap</li>
                    <li>Choose "Webhooks by Zapier" as trigger</li>
                    <li>Select "Catch Hook"</li>
                    <li>Copy the webhook URL provided</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Make.com:</h4>
                  <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                    <li>Go to make.com and create a new scenario</li>
                    <li>Add "Webhooks" module</li>
                    <li>Choose "Custom webhook"</li>
                    <li>Copy the webhook URL provided</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Events</CardTitle>
                <CardDescription>
                  These events will trigger webhooks when they occur
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {WEBHOOK_EVENTS.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-muted"
                    >
                      <span className="text-xl">{event.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{event.name}</p>
                        <p className="text-xs text-muted-foreground">{event.id}</p>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Webhook Payload Example</CardTitle>
                <CardDescription>JSON structure sent to your webhooks</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`{
  "event": "proposal.signed",
  "timestamp": "2025-01-18T10:30:00.000Z",
  "userId": "user-uuid",
  "proposalId": "proposal-uuid",
  "proposalTitle": "Web Design Proposal",
  "clientId": "client-uuid",
  "clientName": "John Doe",
  "clientEmail": "john@example.com",
  "amount": 5000,
  "teamId": "team-uuid",
  "metadata": {}
}`}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Event History</CardTitle>
                <CardDescription>
                  Recent webhook events sent to Zapier or Make.com
                </CardDescription>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6">
                    No webhook events sent yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {history.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30"
                      >
                        <div className="flex-1">
                          <p className="font-medium capitalize text-sm">
                            {event.event_type.replace(/\./g, " • ")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.created_at).toLocaleString()} • Sent to {event.sent_to}
                          </p>
                        </div>
                        <Badge 
                          variant={event.status === "sent" ? "success" : "secondary"}
                        >
                          {event.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Badge({ variant, children }: { variant: string; children: React.ReactNode }) {
  const baseClass = "text-xs font-medium px-2 py-1 rounded";
  const variantClass = variant === "success" ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground";
  return <span className={`${baseClass} ${variantClass}`}>{children}</span>;
}
