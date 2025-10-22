import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, TrendingDown, Activity, Zap, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface ErrorSummary {
  [key: string]: number;
}

interface ErrorLog {
  id: string;
  error_type: string;
  error_message: string;
  severity: string;
  created_at: string;
}

interface PerformanceMetric {
  avg: number;
  max: number;
  min: number;
  count: number;
}

interface PerformanceSummary {
  [key: string]: PerformanceMetric;
}

interface WebVitalMetric {
  avg: number;
  good: number;
  total: number;
}

interface VitalsSummary {
  [key: string]: WebVitalMetric;
}

export default function Monitoring() {
  const [timeRange, setTimeRange] = useState(7);
  const [errors, setErrors] = useState<ErrorSummary>({});
  const [unresolvedErrors, setUnresolvedErrors] = useState<ErrorLog[]>([]);
  const [performance, setPerformance] = useState<PerformanceSummary>({});
  const [vitals, setVitals] = useState<VitalsSummary>({});
  const [apiMetrics, setApiMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonitoringData();
  }, [timeRange]);

  const fetchMonitoringData = async () => {
    setLoading(true);
    try {
      const [errorRes, perfRes, vitalsRes, apiRes] = await Promise.all([
        fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/monitoring-dashboard?metric=errors&days=${timeRange}`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
          }
        ),
        fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/monitoring-dashboard?metric=performance&days=${timeRange}`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
          }
        ),
        fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/monitoring-dashboard?metric=vitals&days=${timeRange}`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
          }
        ),
        fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/monitoring-dashboard?metric=api-performance&days=${timeRange}`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
          }
        ),
      ]);

      if (errorRes.ok) {
        const data = await errorRes.json();
        setErrors(data.errorCounts);
        setUnresolvedErrors(data.unresolvedErrors);
      }

      if (perfRes.ok) {
        const data = await perfRes.json();
        setPerformance(data.performance);
      }

      if (vitalsRes.ok) {
        const data = await vitalsRes.json();
        setVitals(data.vitals);
      }

      if (apiRes.ok) {
        const data = await apiRes.json();
        setApiMetrics(data.apiMetrics);
      }
    } catch (error) {
      console.error("Failed to fetch monitoring data:", error);
    } finally {
      setLoading(false);
    }
  };

  const errorChartData = Object.entries(errors).map(([name, value]) => ({
    name,
    value,
  }));

  const perfChartData = Object.entries(performance).map(([name, metric]) => ({
    name: name.replace("_", " "),
    avg: metric.avg,
    max: metric.max,
  }));

  const vitalsScore = Object.entries(vitals).reduce((acc, [_, v]) => {
    acc.push({
      name: _,
      score: Math.round((v.good / v.total) * 100),
    });
    return acc;
  }, [] as { name: string; score: number }[]);

  const COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <nav className="border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-400" />
            <span className="text-lg font-bold">Monitoring</span>
          </div>
          <div />
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Time Range Filter */}
        <div className="mb-8 flex gap-2">
          {[7, 30, 90].map((days) => (
            <Button
              key={days}
              variant={timeRange === days ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(days)}
              className={timeRange === days ? "bg-blue-600" : ""}
            >
              {days}d
            </Button>
          ))}
        </div>

        {/* Error Monitoring */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Error Summary */}
          <Card className="bg-slate-800/50 border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Error Summary</h2>
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>

            {Object.keys(errors).length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={errorChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {errorChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                No errors in this period
              </div>
            )}
          </Card>

          {/* Unresolved Errors */}
          <Card className="bg-slate-800/50 border-slate-700/50 p-6">
            <h2 className="text-xl font-bold mb-4">Recent Unresolved Errors</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {unresolvedErrors.length > 0 ? (
                unresolvedErrors.map((err) => (
                  <Alert key={err.id} className="bg-red-900/30 border-red-500/50">
                    <AlertDescription>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-red-300">{err.error_type}</p>
                          <p className="text-sm text-red-200">{err.error_message}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(err.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-red-900/50 border-red-500">
                          {err.severity}
                        </Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))
              ) : (
                <p className="text-slate-400">No unresolved errors</p>
              )}
            </div>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card className="bg-slate-800/50 border-slate-700/50 p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-bold">Performance Metrics</h2>
          </div>

          {perfChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={perfChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                  formatter={(value) => `${value}ms`}
                />
                <Legend />
                <Bar dataKey="avg" fill="#3b82f6" name="Avg" />
                <Bar dataKey="max" fill="#ef4444" name="Max" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400">
              No performance data available
            </div>
          )}
        </Card>

        {/* Web Vitals */}
        <Card className="bg-slate-800/50 border-slate-700/50 p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingDown className="w-5 h-5 text-green-400" />
            <h2 className="text-xl font-bold">Web Vitals (% Good)</h2>
          </div>

          {vitalsScore.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vitalsScore}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                  formatter={(value) => `${value}%`}
                />
                <Bar dataKey="score" fill="#10b981" name="Good Score" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400">
              No vitals data available
            </div>
          )}
        </Card>

        {/* Slowest APIs */}
        {apiMetrics.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700/50 p-6">
            <h2 className="text-xl font-bold mb-4">Slowest API Calls</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {apiMetrics.slice(0, 10).map((metric: any, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-700/50 p-3 rounded">
                  <span className="text-sm font-mono text-slate-300">{metric.metric_name}</span>
                  <Badge variant="outline" className="bg-yellow-900/50 border-yellow-500">
                    {metric.value.toFixed(0)}ms
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
