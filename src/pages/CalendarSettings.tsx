import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Loader, Calendar } from "lucide-react";
import { toast } from "sonner";
import { getCalendarSettings, updateCalendarSettings, enableCalendarBooking, disableCalendarBooking } from "@/lib/calendarService";

export default function CalendarSettings() {
  const { userId } = useAuth();
  const [calendlyUrl, setCalendlyUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [bookingEnabled, setBookingEnabled] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const loadSettings = async () => {
      const settings = await getCalendarSettings(userId);
      if (settings?.calendly_url) {
        setCalendlyUrl(settings.calendly_url);
        setBookingEnabled(settings.booking_enabled ?? true);
        setConnected(true);
      }
      setInitializing(false);
    };

    loadSettings();
  }, [userId]);

  const handleConnect = async () => {
    if (!calendlyUrl.trim()) {
      toast.error("Please enter your Calendly URL");
      return;
    }

    if (!calendlyUrl.includes("calendly.com")) {
      toast.error("Please enter a valid Calendly URL (e.g., https://calendly.com/yourname)");
      return;
    }

    setLoading(true);
    const result = await updateCalendarSettings(userId!, calendlyUrl.trim());
    setLoading(false);

    if (result) {
      setConnected(true);
      toast.success("Calendar connected successfully!");
    }
  };

  const handleToggleBooking = async (enabled: boolean) => {
    setLoading(true);
    const result = enabled
      ? await enableCalendarBooking(userId!)
      : await disableCalendarBooking(userId!);
    setLoading(false);

    if (result) {
      setBookingEnabled(enabled);
      toast.success(enabled ? "Booking enabled" : "Booking disabled");
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
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Calendar className="w-8 h-8" />
            Calendar Scheduling
          </h1>
          <p className="text-muted-foreground mt-2">
            Connect your Calendly account to let clients book kickoff meetings directly from proposals
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Calendly Connection</CardTitle>
            <CardDescription>
              {connected
                ? "Your Calendly is connected. Clients can book meetings from proposals."
                : "Add your Calendly link to enable meeting scheduling"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {connected && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  ✓ Calendar is connected and active
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="calendly-url">Calendly Profile URL</Label>
              <Input
                id="calendly-url"
                placeholder="https://calendly.com/yourname"
                value={calendlyUrl}
                onChange={(e) => setCalendlyUrl(e.target.value)}
                disabled={connected}
              />
              <p className="text-xs text-muted-foreground">
                Get your Calendly URL from your Calendly profile settings. Format: https://calendly.com/yourname
              </p>
            </div>

            {connected && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Booking Enabled</p>
                  <p className="text-sm text-muted-foreground">
                    Show "Book Meeting" button on proposals
                  </p>
                </div>
                <Switch
                  checked={bookingEnabled === true}
                  onCheckedChange={handleToggleBooking}
                  disabled={loading}
                />
              </div>
            )}

            {!connected && (
              <Button onClick={handleConnect} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect Calendly"
                )}
              </Button>
            )}

            {connected && (
              <Button
                onClick={() => {
                  setCalendlyUrl("");
                  setConnected(false);
                }}
                variant="outline"
                className="w-full"
              >
                Disconnect
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
                <span>Connect your Calendly account</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">2.</span>
                <span>"Book Kickoff Meeting" button appears on proposals</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary">3.</span>
                <span>Clients click to schedule meetings directly with you</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}