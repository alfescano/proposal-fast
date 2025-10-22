import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft, Users, TrendingUp, ShoppingCart, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface FunnelData {
  [key: string]: number;
}

interface EventData {
  [key: string]: number;
}

export default function Analytics() {
  const [funnelData, setFunnelData] = useState<FunnelData>({});
  const [eventData, setEventData] = useState<EventData>({});
  const [conversionData, setConversionData] = useState<EventData>({});
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadAnalytics();
  }, [days]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!baseUrl || !anonKey) {
        console.warn("Supabase env vars not configured");
        setLoading(false);
        return;
      }
      const [funnelRes, eventsRes, conversionRes] = await Promise.all([
        fetch(`${baseUrl}/functions/v1/analytics-dashboard?metric=funnel`, {
          headers: { Authorization: `Bearer ${anonKey}` },
        }).catch((e) => {
          console.error("Funnel fetch error:", e);
          return null;
        }),
        fetch(`${baseUrl}/functions/v1/analytics-dashboard?metric=events&days=${days}`, {
          headers: { Authorization: `Bearer ${anonKey}` },
        }).catch((e) => {
          console.error("Events fetch error:", e);
          return null;
        }),
        fetch(`${baseUrl}/functions/v1/analytics-dashboard?metric=conversions&days=${days}`, {
          headers: { Authorization: `Bearer ${anonKey}` },
        }).catch((e) => {
          console.error("Conversion fetch error:", e);
          return null;
        }),
      ]);

      if (funnelRes?.ok) {
        const funnelJson = await funnelRes.json();
        setFunnelData(funnelJson.funnel || {});
      }

      if (eventsRes?.ok) {
        const eventsJson = await eventsRes.json();
        setEventData(eventsJson.events || {});
      }

      if (conversionRes?.ok) {
        const conversionJson = await conversionRes.json();
        setConversionData(conversionJson.conversions || {});
      }
    } catch (error) {
      console.error("Failed to load analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const funnelStages = [
    { name: "Landing", key: "landing", icon: Users },
    { name: "Signup", key: "signup", icon: CheckCircle },
    { name: "Generator", key: "generator", icon: TrendingUp },
    { name: "Pricing", key: "pricing", icon: ShoppingCart },
    { name: "Checkout", key: "checkout", icon: ShoppingCart },
    { name: "Customer", key: "customer", icon: CheckCircle },
  ];

  const funnelChartData = funnelStages.map((stage) => ({
    name: stage.name,
    value: funnelData[stage.key] || 0,
  }));

  const eventChartData = Object.entries(eventData).map(([name, count]) => ({
    name: name.replace(/_/g, " "),
    value: count as number,
  }));

  const conversionRate =
    funnelChartData[0]?.value > 0
      ? ((funnelChartData[5]?.value || 0) / funnelChartData[0].value * 100).toFixed(2)
      : "0";

  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-8 pt-4">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon" className="hover:bg-slate-800">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Analytics & Funnel</h1>
          </div>
          <div className="flex gap-2">
            {[7, 30, 90].map((d) => (
              <Button
                key={d}
                variant={days === d ? "default" : "outline"}
                onClick={() => setDays(d)}
                className={days === d ? "bg-blue-600" : "border-slate-600"}
              >
                {d}d
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading analytics...</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="bg-slate-800/50 border-slate-700/50 p-6">
                <p className="text-slate-400 text-sm mb-2">Total Visitors</p>
                <p className="text-3xl font-bold">{funnelChartData[0]?.value || 0}</p>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700/50 p-6">
                <p className="text-slate-400 text-sm mb-2">Sign-ups</p>
                <p className="text-3xl font-bold">{funnelChartData[1]?.value || 0}</p>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700/50 p-6">
                <p className="text-slate-400 text-sm mb-2">Conversions</p>
                <p className="text-3xl font-bold">{funnelChartData[5]?.value || 0}</p>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700/50 p-6">
                <p className="text-slate-400 text-sm mb-2">Conversion Rate</p>
                <p className="text-3xl font-bold">{conversionRate}%</p>
              </Card>
            </div>

            <Card className="bg-slate-800/50 border-slate-700/50 p-6">
              <h2 className="text-xl font-semibold mb-6">Conversion Funnel</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={funnelChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#f1f5f9" }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 p-6">
              <h2 className="text-xl font-semibold mb-6">Stage Breakdown</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {funnelStages.map((stage, idx) => {
                  const count = funnelChartData[idx]?.value || 0;
                  const prevCount = idx > 0 ? funnelChartData[idx - 1]?.value || 1 : count;
                  const dropoff = idx > 0 ? ((1 - count / prevCount) * 100).toFixed(1) : "0";

                  return (
                    <div
                      key={stage.key}
                      className="p-4 bg-slate-700/50 rounded-lg border border-slate-600/50"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <stage.icon className="w-5 h-5 text-blue-400" />
                        <p className="font-semibold">{stage.name}</p>
                      </div>
                      <p className="text-2xl font-bold mb-1">{count}</p>
                      {idx > 0 && (
                        <p className="text-xs text-red-400">↓ {dropoff}% drop</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {eventChartData.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700/50 p-6">
                <h2 className="text-xl font-semibold mb-6">Top Events (Last {days}d)</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={eventChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {eventChartData.map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#f1f5f9" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            )}

            {Object.keys(conversionData).length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700/50 p-6">
                <h2 className="text-xl font-semibold mb-6">Conversion Events</h2>
                <div className="space-y-2">
                  {Object.entries(conversionData).map(([event, count]) => (
                    <div
                      key={event}
                      className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                    >
                      <p className="capitalize">{event.replace(/_/g, " ")}</p>
                      <p className="font-bold text-green-400">{count as number}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}