import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Loader } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function CRMStatusCard() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const checkCRM = async () => {
      try {
        const { data, error } = await supabase
          ?.from("crm_settings")
          .select("id, api_key")
          .eq("user_id", userId)
          .single();

        if (!error && data?.api_key) {
          setConnected(true);
        } else {
          setConnected(false);
        }
      } catch (error) {
        console.error("Error checking CRM status:", error);
        setConnected(false);
      } finally {
        setLoading(false);
      }
    };

    checkCRM();
  }, [userId]);

  if (loading) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950 dark:to-indigo-950 dark:border-blue-800">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">HubSpot CRM</CardTitle>
            <CardDescription>
              {connected
                ? "Your CRM is active. Proposals auto-sync as deals."
                : "Connect HubSpot to auto-sync proposals and track deals."}
            </CardDescription>
          </div>
          {connected ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
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
          onClick={() => navigate("/crm-settings")}
          variant={connected ? "outline" : "default"}
        >
          {connected ? "Manage" : "Setup Now"}
        </Button>
      </CardContent>
    </Card>
  );
}
