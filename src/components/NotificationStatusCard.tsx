import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { getNotificationSettings } from "@/lib/notificationService";

export function NotificationStatusCard() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const checkNotifications = async () => {
      try {
        const settings = await getNotificationSettings(userId);
        if (settings?.enabled && (settings.slack_webhook_url || settings.teams_webhook_url)) {
          setConnected(true);
        } else {
          setConnected(false);
        }
      } catch (error) {
        console.error("Error checking notification status:", error);
        setConnected(false);
      } finally {
        setLoading(false);
      }
    };

    checkNotifications();
  }, [userId]);

  if (loading) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 dark:from-purple-950 dark:to-pink-950 dark:border-purple-800">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Slack & Teams Alerts</CardTitle>
            <CardDescription>
              {connected
                ? "Get real-time alerts on your Slack or Teams workspace."
                : "Enable notifications to get real-time alerts."}
            </CardDescription>
          </div>
          {connected ? (
            <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
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
          onClick={() => navigate("/notifications")}
          variant={connected ? "outline" : "default"}
        >
          {connected ? "Manage" : "Setup Now"}
        </Button>
      </CardContent>
    </Card>
  );
}
