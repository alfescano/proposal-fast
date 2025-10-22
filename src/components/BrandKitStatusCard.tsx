import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, CheckCircle2, AlertCircle } from "lucide-react";
import { useBrandKit } from "@/hooks/useBrandKit";

export function BrandKitStatusCard() {
  const navigate = useNavigate();
  const { brandKit, loading } = useBrandKit();

  if (loading) {
    return null;
  }

  const isConfigured = brandKit?.logo_url && brandKit?.company_name;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950 dark:to-indigo-950 dark:border-blue-800">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Brand Kit & Templates
            </CardTitle>
            <CardDescription>
              {isConfigured
                ? "Your brand kit is configured with logo, colors, and templates."
                : "Set up your brand colors, logo, and contract templates."}
            </CardDescription>
          </div>
          {isConfigured ? (
            <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          )}
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <Badge variant={isConfigured ? "default" : "secondary"}>
          {isConfigured ? "Configured" : "Incomplete"}
        </Badge>
        <Button
          size="sm"
          onClick={() => navigate("/brand-kit")}
          variant={isConfigured ? "outline" : "default"}
        >
          {isConfigured ? "Manage" : "Setup Now"}
        </Button>
      </CardContent>
    </Card>
  );
}
