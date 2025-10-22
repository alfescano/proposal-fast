import { supabase } from "@/lib/supabase";

export interface Event {
  id?: string;
  source: string;
  type: string;
  payload: Record<string, any>;
  created_at?: string;
}

/**
 * Log an event to the universal events table
 */
export async function logEvent(
  source: string,
  type: string,
  payload: Record<string, any> = {}
): Promise<Event | null> {
  if (!supabase) {
    console.warn("Supabase not configured, skipping event logging");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          source,
          type,
          payload,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error logging event:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error logging event:", error);
    return null;
  }
}

/**
 * Log multiple events at once
 */
export async function logEvents(
  events: Array<{
    source: string;
    type: string;
    payload?: Record<string, any>;
  }>
): Promise<Event[] | null> {
  if (!supabase) {
    console.warn("Supabase not configured, skipping event logging");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("events")
      .insert(
        events.map((e) => ({
          source: e.source,
          type: e.type,
          payload: e.payload || {},
        }))
      )
      .select();

    if (error) {
      console.error("Error logging events:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error logging events:", error);
    return null;
  }
}

/**
 * Get events by source
 */
export async function getEventsBySource(
  source: string,
  limit = 100,
  offset = 0
): Promise<Event[] | null> {
  if (!supabase) {
    console.warn("Supabase not configured");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("source", source)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching events:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching events:", error);
    return null;
  }
}

/**
 * Get events by type
 */
export async function getEventsByType(
  type: string,
  limit = 100,
  offset = 0
): Promise<Event[] | null> {
  if (!supabase) {
    console.warn("Supabase not configured");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("type", type)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching events:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching events:", error);
    return null;
  }
}

/**
 * Get events by source and type
 */
export async function getEventsBySourceAndType(
  source: string,
  type: string,
  limit = 100,
  offset = 0
): Promise<Event[] | null> {
  if (!supabase) {
    console.warn("Supabase not configured");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("source", source)
      .eq("type", type)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching events:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching events:", error);
    return null;
  }
}

/**
 * Get recent events
 */
export async function getRecentEvents(
  limit = 50,
  hoursBack = 24
): Promise<Event[] | null> {
  if (!supabase) {
    console.warn("Supabase not configured");
    return null;
  }

  try {
    const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recent events:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching recent events:", error);
    return null;
  }
}

/**
 * Get event count by source
 */
export async function getEventCountBySource(
  source: string
): Promise<number | null> {
  if (!supabase) {
    console.warn("Supabase not configured");
    return null;
  }

  try {
    const { count, error } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("source", source);

    if (error) {
      console.error("Error counting events:", error);
      return null;
    }

    return count;
  } catch (error) {
    console.error("Error counting events:", error);
    return null;
  }
}

/**
 * Search events by payload (JSONB contains)
 */
export async function searchEventsByPayload(
  source: string,
  query: Record<string, any>,
  limit = 50
): Promise<Event[] | null> {
  if (!supabase) {
    console.warn("Supabase not configured");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("source", source)
      .contains("payload", query)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error searching events:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error searching events:", error);
    return null;
  }
}

/**
 * Delete old events (cleanup)
 */
export async function deleteOldEvents(daysOld: number): Promise<number | null> {
  if (!supabase) {
    console.warn("Supabase not configured");
    return null;
  }

  try {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000).toISOString();

    const { count, error } = await supabase
      .from("events")
      .delete()
      .lt("created_at", cutoffDate);

    if (error) {
      console.error("Error deleting old events:", error);
      return null;
    }

    return count;
  } catch (error) {
    console.error("Error deleting old events:", error);
    return null;
  }
}
