import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader } from "lucide-react";
import { getRecentEvents, getEventCountBySource } from "@/lib/eventLogger";
import type { Event } from "@/lib/eventLogger";

export function EventsMonitor() {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventCounts, setEventCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadEvents = async () => {
    try {
      const recentEvents = await getRecentEvents(50, 24);
      if (recentEvents) {
        setEvents(recentEvents);

        // Get counts by source
        const sources = [...new Set(recentEvents.map((e) => e.source))];
        const counts: Record<string, number> = {};

        for (const source of sources) {
          const count = await getEventCountBySource(source);
          if (count !== null) {
            counts[source] = count;
          }
        }

        setEventCounts(counts);
      }
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      stripe: "bg-purple-900/30 text-purple-300 border-purple-700/50",
      clerk: "bg-blue-900/30 text-blue-300 border-blue-700/50",
      crm: "bg-orange-900/30 text-orange-300 border-orange-700/50",
      calendar: "bg-green-900/30 text-green-300 border-green-700/50",
      webhook: "bg-red-900/30 text-red-300 border-red-700/50",
    };
    return colors[source] || "bg-slate-900/30 text-slate-300 border-slate-700/50";
  };

  const formatPayload = (payload: Record<string, any>) => {
    try {
      return JSON.stringify(payload, null, 2).slice(0, 200) + "...";
    } catch {
      return String(payload).slice(0, 200);
    }
  };

  return (
    <div className="space-y-4">
      {/* Source Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {Object.entries(eventCounts).map(([source, count]) => (
          <Card
            key={source}
            className={`p-3 text-center border ${getSourceColor(source)}`}
          >
            <p className="text-xs font-semibold uppercase">{source}</p>
            <p className="text-lg font-bold">{count}</p>
          </Card>
        ))}
      </div>

      {/* Events List */}
      <Card className="bg-slate-800/50 border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Events (24h)</h3>
          {loading && <Loader className="w-4 h-4 animate-spin text-slate-400" />}
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-slate-400 text-sm">No events in the last 24 hours</p>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className={`p-3 rounded-lg border ${getSourceColor(
                  event.source
                )} text-sm`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`capitalize ${getSourceColor(event.source)}`}
                    >
                      {event.source}
                    </Badge>
                    <code className="text-xs bg-slate-900/50 px-2 py-1 rounded">
                      {event.type}
                    </code>
                  </div>
                  <span className="text-xs text-slate-400">
                    {event.created_at
                      ? new Date(event.created_at).toLocaleTimeString()
                      : "N/A"}
                  </span>
                </div>
                <pre className="text-xs bg-slate-900/30 p-2 rounded overflow-x-auto text-slate-300">
                  {formatPayload(event.payload)}
                </pre>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
