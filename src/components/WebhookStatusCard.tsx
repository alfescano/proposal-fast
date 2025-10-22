import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Zap } from "lucide-react";
import { getWebhookIntegration } from "@/lib/webhookService";

export function WebhookStatusCard() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const checkWebhooks = async () => {
      try {
        const integration = await getWebhookIntegration(userId);
        if (integration?.enabled && (integration.zapier_webhook_url || integration.make_webhook_url)) {
          setConnected(true);
        } else {
          setConnected(false);
        }
      } catch (error) {
        console.error("Error checking webhook status:", error);
        setConnected(false);
      } finally {
        setLoading(false);
      }
    };

    checkWebhooks();
  }, [userId]);

  if (loading) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 dark:from-yellow-950 dark:to-orange-950 dark:border-yellow-800">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Workflow Automations
            </CardTitle>
            <CardDescription>
              {connected
                ? "Zapier/Make automations active - proposals trigger workflows."
                : "Enable workflow automations to auto-trigger Zapier/Make zaps."}
            </CardDescription>
          </div>
          {connected ? (
            <CheckCircle2 className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          )}
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <Badge variant={connected ? "default" : "secondary"}>
          {connected ? "Active" : "Not Configured"}
        </Badge>
        <Button
          size="sm"
          onClick={() => navigate("/webhooks")}
          variant={connected ? "outline" : "default"}
        >
          {connected ? "Manage" : "Setup Now"}
        </Button>
      </CardContent>
    </Card>
  );
}
