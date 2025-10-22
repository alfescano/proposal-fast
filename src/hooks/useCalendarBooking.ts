import { useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";

/**
 * Hook to handle opening Calendly booking window
 */
export function useCalendarBooking() {
  const { userId } = useAuth();

  const openCalendlyWindow = useCallback((
    calendlyUrl: string,
    clientName?: string,
    clientEmail?: string
  ) => {
    const params = new URLSearchParams();
    if (clientName) params.append("name", clientName);
    if (clientEmail) params.append("email", clientEmail);

    const fullUrl = `${calendlyUrl}?${params.toString()}`;
    window.open(fullUrl, "calendly_booking", "width=600,height=700");
  }, []);

  return { openCalendlyWindow };
}
