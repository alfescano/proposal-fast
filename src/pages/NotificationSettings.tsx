import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader, Bell, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  getNotificationSettings,
  updateNotificationSettings,
  testSlackWebhook,
  getNotificationHistory,
} from "@/lib/notificationService";

export default function NotificationSettings() {
  const { userId } = useAuth();
  const [slackUrl, setSlackUrl] = useState("");
  const [teamsUrl, setTeamsUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [notifyProposalViewed, setNotifyProposalViewed] = useState(true);
  const [notifyProposalSigned, setNotifyProposalSigned] = useState(true);
  const [notifyPaymentFailed, setNotifyPaymentFailed] = useState(true);
  const [notifySignatureRequested, setNotifySignatureRequested] = useState(true);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;

    const loadSettings = async () => {
      const settings = await getNotificationSettings(userId);
      if (settings) {
        setSlackUrl(settings.slack_webhook_url || "");
        setTeamsUrl(settings.teams_webhook_url || "");
        setEnabled(settings.enabled);
        setNotifyProposalViewed(settings.notify_proposal_viewed);
        setNotifyProposalSigned(settings.notify_proposal_signed);
        setNotifyPaymentFailed(settings.notify_payment_failed);
        setNotifySignatureRequested(settings.notify_signature_requested);
      }

      const logs = await getNotificationHistory(userId);
      setHistory(logs);
      setInitializing(false);
    };

    loadSettings();
  }, [userId]);

  const handleSaveSettings = async () => {
    if (!slackUrl && !teamsUrl) {
      toast.error("Please enter at least one webhook URL");
      return;
    }

    setLoading(true);
    const result = await updateNotificationSettings(userId!, {
      slack_webhook_url: slackUrl || undefined,
      teams_webhook_url: teamsUrl || undefined,
      enabled: slackUrl || teamsUrl ? enabled : false,
      notify_proposal_viewed: notifyProposalViewed,
      notify_proposal_signed: notifyProposalSigned,
      notify_payment_failed: notifyPaymentFailed,
      notify_signature_requested: notifySignatureRequested,
    });
    setLoading(false);

    if (result) {
      toast.success("Notification settings saved!");
    }
  };

  const handleTestSlack = async () => {
    if (!slackUrl) {
      toast.error("Please enter a Slack webhook URL");
      return;
    }

    setLoading(true);
    const success = await testSlackWebhook(userId!, slackUrl);
    setLoading(false);

    if (success) {
      const logs = await getNotificationHistory(userId!);
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
            <Bell className="w-8 h-8" />
            Notifications
          </h1>
          <p className="text-muted-foreground mt-2">
            Get real-time alerts on Slack or Microsoft Teams for important events
          </p>
        </div>

        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-4">
            {enabled && (slackUrl || teamsUrl) && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Notifications are active and configured
                </AlertDescription>
              </Alert>
            )}

            {!enabled && (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Notifications are currently disabled. Configure webhooks and enable below.
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Webhook Configuration</CardTitle>
                <CardDescription>
                  Add Slack or Microsoft Teams incoming webhooks to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Slack */}
                <div className="space-y-2">
                  <Label htmlFor="slack-url">Slack Webhook URL</Label>
                  <Input
                    id="slack-url"
                    placeholder="https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX"
                    value={slackUrl}
                    onChange={(e) => setSlackUrl(e.target.value)}
                    type="password"
                  />
                  <p className="text-xs text-muted-foreground">
                    Get this from Slack &gt; Your Workspace &gt; Settings &gt; Manage Apps &gt; Incoming Webhooks
                  </p>
                  <Button
                    onClick={handleTestSlack}
                    disabled={loading || !slackUrl}
                    variant="outline"
                    size="sm"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-3 h-3 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      "Test Slack Connection"
                    )}
                  </Button>
                </div>

                {/* Teams */}
                <div className="space-y-2">
                  <Label htmlFor="teams-url">Microsoft Teams Webhook URL</Label>
                  <Input
                    id="teams-url"
                    placeholder="https://outlook.webhook.office.com/webhookb2/..."
                    value={teamsUrl}
                    onChange={(e) => setTeamsUrl(e.target.value)}
                    type="password"
                  />
                  <p className="text-xs text-muted-foreground">
                    Get this from Teams &gt; Connectors &gt; Incoming Webhook
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Event Triggers */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Triggers</CardTitle>
                <CardDescription>
                  Choose which events trigger notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted">
                  <Checkbox
                    id="proposal-viewed"
                    checked={notifyProposalViewed}
                    onCheckedChange={(checked) => setNotifyProposalViewed(checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="proposal-viewed" className="font-medium cursor-pointer">
                      Proposal Viewed
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Get notified when a client views your proposal
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted">
                  <Checkbox
                    id="proposal-signed"
                    checked={notifyProposalSigned}
                    onCheckedChange={(checked) => setNotifyProposalSigned(checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="proposal-signed" className="font-medium cursor-pointer">
                      Proposal Signed
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Get notified when a client signs your proposal
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted">
                  <Checkbox
                    id="signature-requested"
                    checked={notifySignatureRequested}
                    onCheckedChange={(checked) => setNotifySignatureRequested(checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="signature-requested" className="font-medium cursor-pointer">
                      Signature Requested
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Get notified when you send a proposal for signature
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted">
                  <Checkbox
                    id="payment-failed"
                    checked={notifyPaymentFailed}
                    onCheckedChange={(checked) => setNotifyPaymentFailed(checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="payment-failed" className="font-medium cursor-pointer">
                      Payment Failed
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Get notified when a payment fails
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button
              onClick={handleSaveSettings}
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
                "Save Notification Settings"
              )}
            </Button>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification History</CardTitle>
                <CardDescription>
                  Recent notifications sent to Slack or Teams
                </CardDescription>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6">
                    No notifications sent yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {history.map((log) => (
                      <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                        <div className="flex-1">
                          <p className="font-medium capitalize">
                            {log.event_type.replace(/_/g, " ")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.created_at).toLocaleString()} • Sent via {log.sent_to}
                          </p>
                        </div>
                        <Badge variant="secondary">{log.status}</Badge>
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
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded ${
      variant === "secondary" ? "bg-muted text-muted-foreground" : ""
    }`}>
      {children}
    </span>
  );
}
