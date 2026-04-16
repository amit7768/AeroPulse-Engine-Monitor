"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Navbar from "@/components/Navbar";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  ChevronDown,
  RefreshCw,
  Shield,
  Thermometer,
  Zap,
} from "lucide-react";

const ENGINES = ["ENG-4721-X", "ENG-3310-B", "ENG-0897-C", "ENG-5521-D"];

type SensorData = {
  label: string;
  unit: string;
  current: number;
  nominal: [number, number];
  warning: [number, number];
  critical: [number, number];
  history: number[];
  timestamps: string[];
};

type SummaryData = {
  engineId: string;
  status: string;
  rul: number;
  lastUpdated: string;
  fleetEngines: { id: string; rul: number; status: string }[];
  sensors: Record<string, SensorData>;
  degradationCurve: {
    predicted: { cycle: number; rul: number; lowerBound: number; upperBound: number }[];
  };
  maintenanceHistory: { date: string; type: string; notes: string }[];
};

const STATUS_CONFIG = {
  nominal: { label: "NOMINAL", color: "var(--success)", glow: "glow-success" },
  warning: { label: "WARNING", color: "var(--warning)", glow: "glow-warning" },
  critical: { label: "CRITICAL", color: "var(--danger)", glow: "glow-danger" },
};

function getSensorStatus(sensor: SensorData) {
  const v = sensor.current;
  const [cn1, cn2] = sensor.critical;
  const [wn1, wn2] = sensor.warning;
  if (v >= cn1 && v <= cn2) return "critical";
  if (v >= wn1 && v <= wn2) return "warning";
  return "nominal";
}

function getRulPercent(rul: number) {
  return Math.min(100, (rul / 130) * 100);
}

function RulGauge({ rul }: { rul: number }) {
  const pct = getRulPercent(rul);
  const color = rul < 40 ? "var(--danger)" : rul < 80 ? "var(--warning)" : "var(--success)";
  const circumference = 2 * Math.PI * 54;
  const dash = (pct / 100) * circumference;

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r="54" fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <div className="text-center z-10">
        <div className="text-3xl font-bold font-mono-aerospace" style={{ color }}>{rul}</div>
        <div className="text-[10px] text-[var(--text-muted)] font-mono-aerospace tracking-widest">CYCLES</div>
        <div className="text-[10px] font-mono-aerospace" style={{ color }}>RUL</div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="panel p-3 text-xs font-mono-aerospace">
      <div className="text-[var(--text-muted)] mb-1">{String(label).slice(11, 16)}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex gap-2 items-center">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          <span style={{ color: p.color }}>{parseFloat(p.value).toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [selectedEngine, setSelectedEngine] = useState(ENGINES[0]);
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/engine-summary?engineId=${selectedEngine}&points=48`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedEngine]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [selectedEngine, fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(fetchData, 30000);
    return () => clearInterval(id);
  }, [autoRefresh, fetchData]);

  const statusCfg = data ? STATUS_CONFIG[data.status as keyof typeof STATUS_CONFIG] : STATUS_CONFIG.nominal;

  function buildChartData(sensor: SensorData) {
    return sensor.history.map((v, i) => ({
      time: sensor.timestamps[i],
      value: v,
    }));
  }

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] bg-grid">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-6 pt-24 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-[var(--cyan-glow)]" />
              <span className="text-xs font-mono-aerospace text-[var(--text-muted)] tracking-widest">
                ENGINE HEALTH DASHBOARD
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white">Real-Time Monitoring</h1>
          </div>

          {/* Engine selector + refresh */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setLoading(true); fetchData(); }}
              className="p-2 panel hover:border-[rgba(0,229,255,0.3)] transition-colors rounded"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-[var(--cyan-glow)] ${loading ? "animate-spin" : ""}`} />
            </button>

            <div className="relative">
              <button
                onClick={() => setOpenDropdown(!openDropdown)}
                className="panel flex items-center gap-3 px-4 py-2.5 text-sm font-mono-aerospace hover:border-[rgba(0,229,255,0.3)] transition-colors min-w-[180px] justify-between"
              >
                <span className="text-[var(--cyan-glow)]">{selectedEngine}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              </button>
              {openDropdown && (
                <div className="absolute top-full mt-1 left-0 right-0 panel z-20 overflow-hidden">
                  {ENGINES.map((eng) => (
                    <button
                      key={eng}
                      onClick={() => { setSelectedEngine(eng); setOpenDropdown(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-mono-aerospace transition-colors hover:bg-[rgba(0,229,255,0.06)] ${
                        eng === selectedEngine ? "text-[var(--cyan-glow)]" : "text-[var(--text-muted)]"
                      }`}
                    >
                      {eng}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-3 py-2.5 text-xs font-mono-aerospace rounded border transition-colors ${
                autoRefresh
                  ? "border-[rgba(0,255,136,0.3)] text-[var(--success)] bg-[rgba(0,255,136,0.05)]"
                  : "border-[rgba(255,255,255,0.1)] text-[var(--text-muted)]"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? "status-ok" : "bg-[var(--text-muted)]"}`} />
              {autoRefresh ? "LIVE" : "PAUSED"}
            </button>
          </div>
        </div>

        {loading && !data ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-[var(--cyan-glow)] animate-spin mx-auto mb-3" />
              <div className="text-sm font-mono-aerospace text-[var(--text-muted)]">LOADING TELEMETRY...</div>
            </div>
          </div>
        ) : data ? (
          <>
            {/* Top KPI row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="panel p-5 flex items-center gap-4"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${statusCfg.glow}`} style={{ border: `2px solid ${statusCfg.color}` }}>
                  <Shield className="w-5 h-5" style={{ color: statusCfg.color }} />
                </div>
                <div>
                  <div className="text-xs font-mono-aerospace text-[var(--text-muted)] tracking-widest">HEALTH STATUS</div>
                  <div className="text-lg font-bold mt-0.5" style={{ color: statusCfg.color }}>{statusCfg.label}</div>
                </div>
              </motion.div>

              {/* RUL */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="panel p-5 flex items-center justify-center"
              >
                <RulGauge rul={data.rul} />
              </motion.div>

              {/* EGT */}
              {data.sensors.temperature && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="panel p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Thermometer className="w-3.5 h-3.5 text-[#ff6644]" />
                    <span className="text-xs font-mono-aerospace text-[var(--text-muted)] tracking-widest">EGT</span>
                  </div>
                  <div className="text-2xl font-bold font-mono-aerospace text-white">
                    {data.sensors.temperature.current}
                    <span className="text-sm text-[var(--text-muted)] ml-1">°C</span>
                  </div>
                  <div className="risk-bar-track mt-3">
                    <div
                      className="risk-bar-fill"
                      style={{
                        width: `${Math.min(100, ((data.sensors.temperature.current - 500) / 300) * 100)}%`,
                        background: getSensorStatus(data.sensors.temperature) === "critical" ? "var(--danger)" : getSensorStatus(data.sensors.temperature) === "warning" ? "var(--warning)" : "var(--success)",
                      }}
                    />
                  </div>
                  <div className="text-[10px] font-mono-aerospace text-[var(--text-muted)] mt-1">
                    {data.sensors.temperature.nominal[0]}–{data.sensors.temperature.nominal[1]} °C nominal
                  </div>
                </motion.div>
              )}

              {/* Vibration */}
              {data.sensors.vibration && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="panel p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-3.5 h-3.5 text-[var(--blue-accent)]" />
                    <span className="text-xs font-mono-aerospace text-[var(--text-muted)] tracking-widest">VIBRATION</span>
                  </div>
                  <div className="text-2xl font-bold font-mono-aerospace text-white">
                    {data.sensors.vibration.current.toFixed(2)}
                    <span className="text-sm text-[var(--text-muted)] ml-1">mm/s</span>
                  </div>
                  <div className="risk-bar-track mt-3">
                    <div
                      className="risk-bar-fill"
                      style={{
                        width: `${Math.min(100, (data.sensors.vibration.current / 2.5) * 100)}%`,
                        background: getSensorStatus(data.sensors.vibration) === "critical" ? "var(--danger)" : getSensorStatus(data.sensors.vibration) === "warning" ? "var(--warning)" : "var(--success)",
                      }}
                    />
                  </div>
                  <div className="text-[10px] font-mono-aerospace text-[var(--text-muted)] mt-1">
                    ISO 10816: &lt;0.7 nominal
                  </div>
                </motion.div>
              )}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-5 mb-6">
              {/* EGT Chart */}
              {data.sensors.temperature && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="panel p-5"
                >
                  <div className="flex items-center gap-2 mb-5">
                    <Thermometer className="w-4 h-4 text-[#ff6644]" />
                    <span className="text-sm font-semibold text-white">Exhaust Gas Temperature — 48h History</span>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={buildChartData(data.sensors.temperature)}>
                      <defs>
                        <linearGradient id="egtGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff6644" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ff6644" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="time" tickFormatter={(t) => String(t).slice(11, 16)} tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                      <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} width={40} />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine y={data.sensors.temperature.warning[0]} stroke="var(--warning)" strokeDasharray="4 4" strokeOpacity={0.5} />
                      <ReferenceLine y={data.sensors.temperature.critical[0]} stroke="var(--danger)" strokeDasharray="4 4" strokeOpacity={0.5} />
                      <Area type="monotone" dataKey="value" stroke="#ff6644" strokeWidth={1.5} fill="url(#egtGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              )}

              {/* Vibration Chart */}
              {data.sensors.vibration && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="panel p-5"
                >
                  <div className="flex items-center gap-2 mb-5">
                    <Zap className="w-4 h-4 text-[var(--blue-accent)]" />
                    <span className="text-sm font-semibold text-white">Fan Vibration — 48h History</span>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={buildChartData(data.sensors.vibration)}>
                      <defs>
                        <linearGradient id="vibGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0066ff" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#0066ff" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="time" tickFormatter={(t) => String(t).slice(11, 16)} tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                      <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} width={40} />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine y={0.7} stroke="var(--warning)" strokeDasharray="4 4" strokeOpacity={0.5} />
                      <ReferenceLine y={1.2} stroke="var(--danger)" strokeDasharray="4 4" strokeOpacity={0.5} />
                      <Area type="monotone" dataKey="value" stroke="#0066ff" strokeWidth={1.5} fill="url(#vibGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              )}

              {/* Degradation Curve */}
              <motion.div
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="panel p-5"
              >
                <div className="flex items-center gap-2 mb-5">
                  <BarChart3 className="w-4 h-4 text-[var(--cyan-glow)]" />
                  <span className="text-sm font-semibold text-white">RUL Degradation Forecast</span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={data.degradationCurve.predicted}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="cycle" tick={{ fill: "var(--text-muted)", fontSize: 10 }} label={{ value: "Cycles", position: "insideBottom", fill: "var(--text-muted)", fontSize: 10 }} />
                    <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} width={35} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={40} stroke="var(--danger)" strokeDasharray="4 4" strokeOpacity={0.6} label={{ value: "Critical", fill: "var(--danger)", fontSize: 10 }} />
                    <Line type="monotone" dataKey="upperBound" stroke="rgba(0,229,255,0.2)" strokeWidth={1} dot={false} />
                    <Line type="monotone" dataKey="lowerBound" stroke="rgba(0,229,255,0.2)" strokeWidth={1} dot={false} />
                    <Line type="monotone" dataKey="rul" stroke="var(--cyan-glow)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Pressure Chart */}
              {data.sensors.pressure && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="panel p-5"
                >
                  <div className="flex items-center gap-2 mb-5">
                    <Activity className="w-4 h-4 text-[var(--cyan-dim)]" />
                    <span className="text-sm font-semibold text-white">HPC Outlet Pressure — 48h History</span>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={buildChartData(data.sensors.pressure)}>
                      <defs>
                        <linearGradient id="pressGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="time" tickFormatter={(t) => String(t).slice(11, 16)} tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                      <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} width={40} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="value" stroke="var(--cyan-dim)" strokeWidth={1.5} fill="url(#pressGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              )}
            </div>

            {/* Fleet Status + Maintenance History */}
            <div className="grid lg:grid-cols-2 gap-5">
              {/* Fleet */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="panel p-5"
              >
                <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[var(--cyan-glow)]" /> Fleet Health Overview
                </h3>
                <div className="space-y-3">
                  {data.fleetEngines.map((eng) => {
                    const pct = getRulPercent(eng.rul);
                    const col = eng.rul < 40 ? "var(--danger)" : eng.rul < 80 ? "var(--warning)" : "var(--success)";
                    const st = STATUS_CONFIG[eng.status as keyof typeof STATUS_CONFIG];
                    return (
                      <div key={eng.id} className={`flex items-center gap-3 p-3 rounded ${selectedEngine === eng.id ? "bg-[rgba(0,229,255,0.06)] border border-[rgba(0,229,255,0.15)]" : ""}`}>
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: st?.color ?? "var(--success)" }} />
                        <span className="font-mono-aerospace text-sm flex-shrink-0 w-28" style={{ color: selectedEngine === eng.id ? "var(--cyan-glow)" : "var(--text-muted)" }}>
                          {eng.id}
                        </span>
                        <div className="flex-1 risk-bar-track">
                          <div className="risk-bar-fill" style={{ width: `${pct}%`, background: col }} />
                        </div>
                        <span className="font-mono-aerospace text-sm font-bold w-16 text-right" style={{ color: col }}>
                          {eng.rul} <span className="text-[10px] opacity-60">cyc</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Maintenance History */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="panel p-5"
              >
                <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[var(--warning)]" /> Maintenance History
                </h3>
                <div className="space-y-3">
                  {data.maintenanceHistory.map((item, i) => (
                    <div key={i} className="flex gap-4 pb-3 border-b border-[rgba(255,255,255,0.04)] last:border-0">
                      <div className="text-xs font-mono-aerospace text-[var(--cyan-dim)] w-24 flex-shrink-0 pt-0.5">{item.date}</div>
                      <div>
                        <div className="text-sm font-semibold text-white">{item.type}</div>
                        <div className="text-xs text-[var(--text-muted)] mt-0.5">{item.notes}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
