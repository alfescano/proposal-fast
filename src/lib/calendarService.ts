import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface CalendarSettings {
  id: string;
  user_id: string;
  calendar_provider: string;
  calendly_url?: string;
  calendly_api_key?: string;
  booking_enabled: boolean;
}

/**
 * Get user's calendar settings
 */
export async function getCalendarSettings(userId: string): Promise<CalendarSettings | null> {
  try {
    const { data, error } = await supabase
      ?.from("calendar_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to fetch calendar settings:", error);
    return null;
  }
}

/**
 * Update or create calendar settings
 */
export async function updateCalendarSettings(
  userId: string,
  calendlyUrl: string,
  calendlyApiKey?: string
) {
  try {
    const { data, error } = await supabase?.from("calendar_settings").upsert(
      {
        user_id: userId,
        calendar_provider: "calendly",
        calendly_url: calendlyUrl,
        calendly_api_key: calendlyApiKey,
        booking_enabled: true,
      },
      { onConflict: "user_id" }
    );

    if (error) throw error;
    toast.success("Calendar settings updated successfully");
    return data;
  } catch (error) {
    console.error("Failed to update calendar settings:", error);
    toast.error("Failed to update calendar settings");
    return null;
  }
}

/**
 * Disable calendar booking
 */
export async function disableCalendarBooking(userId: string) {
  try {
    const { error } = await supabase
      ?.from("calendar_settings")
      .update({ booking_enabled: false })
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Failed to disable calendar booking:", error);
    return false;
  }
}

/**
 * Enable calendar booking
 */
export async function enableCalendarBooking(userId: string) {
  try {
    const { error } = await supabase
      ?.from("calendar_settings")
      .update({ booking_enabled: true })
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Failed to enable calendar booking:", error);
    return false;
  }
}
