import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Calendar, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getCalendarSettings } from "@/lib/calendarService";

interface BookKickoffMeetingProps {
  clientName?: string;
  clientEmail?: string;
  size?: "sm" | "md" | "lg" | "default";
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

export function BookKickoffMeeting({
  clientName,
  clientEmail,
  size = "default",
  variant = "default",
  className,
}: BookKickoffMeetingProps) {
  const { userId } = useAuth();
  const [calendlyUrl, setCalendlyUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notConfigured, setNotConfigured] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const loadSettings = async () => {
      const settings = await getCalendarSettings(userId);
      if (settings?.calendly_url && settings.booking_enabled) {
        setCalendlyUrl(settings.calendly_url);
        setNotConfigured(false);
      } else {
        setNotConfigured(true);
      }
      setLoading(false);
    };

    loadSettings();
  }, [userId]);

  const handleBookMeeting = () => {
    if (!calendlyUrl) return;

    // Build Calendly URL with prefilled parameters
    const params = new URLSearchParams();
    if (clientName) params.append("name", clientName);
    if (clientEmail) params.append("email", clientEmail);

    const fullUrl = `${calendlyUrl}?${params.toString()}`;

    // Open in new window
    window.open(fullUrl, "calendly_booking", "width=600,height=700");
  };

  if (loading) {
    return null;
  }

  if (notConfigured || !calendlyUrl) {
    return null;
  }

  return (
    <Button
      onClick={handleBookMeeting}
      size={size}
      variant={variant}
      className={className}
    >
      <Calendar className="w-4 h-4 mr-2" />
      Book Kickoff Meeting
    </Button>
  );
}

/**
 * Admin notification component when calendar is not configured
 */
export function BookKickoffMeetingAdmin() {
  const { userId } = useAuth();
  const [notConfigured, setNotConfigured] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const checkSettings = async () => {
      const settings = await getCalendarSettings(userId);
      setNotConfigured(!settings?.calendly_url);
    };

    checkSettings();
  }, [userId]);

  if (!notConfigured) return null;

  return (
    <Alert className="bg-amber-50 border-amber-200">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800">
        Calendar scheduling is not configured. <a href="/calendar-settings" className="font-semibold underline">Set it up</a> to let clients book kickoff meetings.
      </AlertDescription>
    </Alert>
  );
}
