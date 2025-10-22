import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function CalendarStatusCard() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const checkCalendar = async () => {
      try {
        const { data, error } = await supabase
          ?.from("calendar_settings")
          .select("id, calendly_url")
          .eq("user_id", userId)
          .single();

        if (!error && data?.calendly_url) {
          setConnected(true);
        } else {
          setConnected(false);
        }
      } catch (error) {
        console.error("Error checking calendar status:", error);
        setConnected(false);
      } finally {
        setLoading(false);
      }
    };

    checkCalendar();
  }, [userId]);

  if (loading) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200 dark:from-cyan-950 dark:to-blue-950 dark:border-cyan-800">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Calendly Booking</CardTitle>
            <CardDescription>
              {connected
                ? "Clients can book kickoff meetings from proposals."
                : "Enable clients to schedule kickoff meetings directly."}
            </CardDescription>
          </div>
          {connected ? (
            <CheckCircle2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          )}
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <Badge variant={connected ? "default" : "secondary"}>
          {connected ? "Active" : "Not Connected"}
        </Badge>
        <Button
          size="sm"
          onClick={() => navigate("/calendar-settings")}
          variant={connected ? "outline" : "default"}
        >
          {connected ? "Manage" : "Setup Now"}
        </Button>
      </CardContent>
    </Card>
  );
}
