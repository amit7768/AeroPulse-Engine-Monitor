"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import JetEngine3D from "@/components/JetEngine3D";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  ChevronDown,
  Database,
  Gauge,
  Shield,
  Thermometer,
  TrendingDown,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const STATS = [
  { label: "Engines Monitored", value: "2,847", unit: "active", color: "var(--cyan-glow)" },
  { label: "RUL Accuracy", value: "94.3", unit: "%", color: "var(--success)" },
  { label: "Avg RMSE", value: "11.2", unit: "cycles", color: "var(--cyan-dim)" },
  { label: "Early Warnings", value: "99.1", unit: "% recall", color: "var(--warning)" },
];

const FEATURES = [
  {
    icon: Activity,
    title: "Real-Time Sensor Telemetry",
    desc: "14-parameter continuous monitoring across EGT, vibration, pressure, and N1/N2 fan speeds with 15-minute update cycles.",
    color: "#00e5ff",
  },
  {
    icon: TrendingDown,
    title: "Degradation Detection",
    desc: "LSTM-powered health index tracking detects anomalous degradation curves 200+ cycles before failure threshold.",
    color: "#0066ff",
  },
  {
    icon: Gauge,
    title: "RUL Prediction",
    desc: "Bidirectional LSTM model trained on NASA C-MAPSS achieves RMSE 11.2 — competitive with published SOTA baselines.",
    color: "#00e5ff",
  },
  {
    icon: AlertTriangle,
    title: "Risk Scoring Engine",
    desc: "Composite 0–100 risk index integrating multi-sensor anomalies, degradation rate, and maintenance compliance signals.",
    color: "#ffaa00",
  },
  {
    icon: Shield,
    title: "Maintenance Advisor",
    desc: "MSG-3, ATA Ch.72, and IATA-compliant maintenance scheduling with automated AOG alerts and MRO work order preparation.",
    color: "#00ff88",
  },
  {
    icon: Bot,
    title: "AI Chat Assistant",
    desc: "Engineering-grade NLP assistant explains predictions, sensor readings, and maintenance decisions in aerospace domain language.",
    color: "#8888ff",
  },
];

// HUD orbit rings component
function EngineHero({ data, loading }: { data: any; loading: boolean }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 80);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-[420px] h-[420px] flex items-center justify-center select-none">
      {/* Background radial glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(0,229,255,0.12) 0%, rgba(0,102,255,0.06) 40%, transparent 70%)",
        }}
      />

      {/* Outer orbit ring */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full border border-[rgba(0,229,255,0.15)]"
        style={{ transform: `rotate(${tick * 0.5}deg)` }}
      >
        {[0, 90, 180, 270].map((angle) => (
          <div
            key={angle}
            className="absolute w-3 h-3 rounded-full bg-[var(--cyan-glow)] glow-cyan-sm"
            style={{
              top: "50%",
              left: "50%",
              transform: `rotate(${angle}deg) translateX(196px) translate(-50%, -50%)`,
            }}
          />
        ))}
      </div>

      {/* Middle orbit ring */}
      <div
        className="absolute w-[300px] h-[300px] rounded-full border border-[rgba(0,102,255,0.25)]"
        style={{ transform: `rotate(${-tick * 0.8}deg)` }}
      >
        {[45, 135, 225, 315].map((angle) => (
          <div
            key={angle}
            className="absolute w-2 h-2 rounded-full bg-[var(--blue-accent)]"
            style={{
              top: "50%",
              left: "50%",
              transform: `rotate(${angle}deg) translateX(146px) translate(-50%, -50%)`,
            }}
          />
        ))}
        {/* Dashed arc segment */}
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-[rgba(0,229,255,0.4)]"
          style={{ clipPath: "polygon(50% 0%, 100% 0%, 100% 50%, 50% 50%)" }}
        />
      </div>

      {/* Inner ring */}
      <div
        className="absolute w-[200px] h-[200px] rounded-full border border-[rgba(0,229,255,0.3)] glow-cyan"
        style={{ transform: `rotate(${tick * 1.2}deg)` }}
      >
        {[0, 120, 240].map((angle) => (
          <div
            key={angle}
            className="absolute w-1.5 h-1.5 bg-[var(--cyan-glow)] rounded-full"
            style={{
              top: "50%",
              left: "50%",
              transform: `rotate(${angle}deg) translateX(96px) translate(-50%, -50%)`,
            }}
          />
        ))}
      </div>

      {/* Core engine disc */}
      <div
        className="absolute w-[140px] h-[140px] rounded-full flex items-center justify-center"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(0,229,255,0.2), rgba(0,102,255,0.3), rgba(0,229,255,0.2), rgba(0,0,50,0.8) 270deg, rgba(0,229,255,0.2))",
          border: "2px solid rgba(0,229,255,0.5)",
          boxShadow: "0 0 40px rgba(0,229,255,0.3), inset 0 0 40px rgba(0,102,255,0.2)",
          transform: `rotate(${tick * 2}deg)`,
        }}
      >
        <div
          className="w-[80px] h-[80px] rounded-full flex items-center justify-center"
          style={{
            background: "radial-gradient(circle, rgba(0,229,255,0.15) 0%, var(--bg-dark) 70%)",
            border: "1px solid rgba(0,229,255,0.4)",
            transform: `rotate(${-tick * 2}deg)`,
          }}
        >
          <Activity className="w-8 h-8 text-[var(--cyan-glow)]" strokeWidth={1.5} />
        </div>
      </div>

      {/* HUD readout labels */}
      <div className="absolute top-4 left-8 text-xs font-mono-aerospace text-[var(--cyan-dim)] opacity-70">
        N1: 88.5%
      </div>
      <div className="absolute top-4 right-8 text-xs font-mono-aerospace text-[var(--cyan-dim)] opacity-70">
        T24: {loading ? "..." : `${data?.sensors?.T24}°R`}
      </div>
      <div className="absolute bottom-8 left-8 text-xs font-mono-aerospace text-[var(--success)] opacity-90" style={{ color: loading ? "var(--success)" : data?.status === "Critical" ? "var(--danger)" : data?.status === "Warning" ? "var(--warning)" : "var(--success)" }}>
        ● {loading ? "LOADING" : (data?.status?.toUpperCase() || "NOMINAL")}
      </div>
      <div className="absolute bottom-8 right-6 text-xs font-mono-aerospace text-[var(--cyan-dim)] opacity-70">
        RUL: {loading ? "..." : data?.predictedRul}
      </div>

      {/* Scan line sweep */}
      <div
        className="absolute w-[200px] h-[1px] bg-gradient-to-r from-transparent via-[rgba(0,229,255,0.6)] to-transparent"
        style={{
          top: "50%",
          left: "50%",
          transformOrigin: "left center",
          transform: `translateX(-6px) rotate(${tick * 2}deg)`,
          opacity: 0.5,
        }}
      />

      {/* Pulse ring */}
      <div
        className="absolute w-[160px] h-[160px] rounded-full border border-[rgba(0,229,255,0.15)]"
        style={{
          transform: `scale(${1 + (Math.sin(tick * 0.08) + 1) * 0.15})`,
          opacity: 1 - (Math.sin(tick * 0.08) + 1) * 0.4,
        }}
      />
    </div>
  );
}

// Animated counter hook
function useCounter(target: number, duration = 2000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const interval = setInterval(() => {
      start += step;
      if (start >= target) {
        setValue(target);
        clearInterval(interval);
      } else {
        setValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(interval);
  }, [target, duration]);
  return value;
}

function StatCard({ stat, index }: { stat: (typeof STATS)[0]; index: number }) {
  const numericVal = parseFloat(stat.value.replace(",", ""));
  const count = useCounter(numericVal, 1500 + index * 300);
  const display = stat.value.includes(",")
    ? count.toLocaleString()
    : count.toFixed(stat.value.includes(".") ? 1 : 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.6 }}
      className="panel bracket-corner p-5 text-center"
    >
      <div className="metric-value" style={{ color: stat.color }}>
        {display}
        <span className="text-base font-normal ml-1 opacity-60">{stat.unit}</span>
      </div>
      <div className="mt-2 text-xs font-mono-aerospace text-[var(--text-muted)] tracking-widest uppercase">
        {stat.label}
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);

  const [trends, setTrends] = useState<any[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(true);

  const [heroData, setHeroData] = useState<any>(null);
  const [loadingHero, setLoadingHero] = useState(true);

  useEffect(() => {
    async function fetchTrends() {
      try {
        const res = await fetch("/api/showcase/trends");
        const json = await res.json();
        if (json.trends) {
          setTrends(json.trends);
        }
      } catch (err) {
        console.error("Error fetching showcase trends:", err);
      } finally {
        setLoadingTrends(false);
      }
    }

    async function fetchHeroData() {
      try {
        const res = await fetch("/api/chatbot/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ engineId: "ENG-4721-X" }), // First default engine
        });
        const data = await res.json();
        setHeroData(data);
      } catch (err) {
        console.error("Error fetching hero data:", err);
      } finally {
        setLoadingHero(false);
      }
    }

    fetchTrends();
    fetchHeroData();
  }, []);

  const heroColor = loadingHero 
    ? "var(--success)" 
    : heroData?.status === "Critical" 
    ? "var(--danger)" 
    : heroData?.status === "Warning" 
    ? "var(--warning)" 
    : "var(--success)";

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] bg-grid overflow-x-hidden">
      <Navbar />

      {/* ── HERO ── */}
      <motion.section
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden"
      >
        {/* Background glows */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[rgba(0,102,255,0.06)] blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[rgba(0,229,255,0.05)] blur-[80px] pointer-events-none" />

        <div className="max-w-[1300px] mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full border border-[rgba(0,229,255,0.25)] bg-[rgba(0,229,255,0.06)]"
            >
              <Zap className="w-3 h-3 text-[var(--cyan-glow)]" />
              <span className="text-xs font-mono-aerospace tracking-[0.2em] text-[var(--cyan-dim)]">
                AI-POWERED PREDICTIVE MAINTENANCE
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight mb-6"
            >
              <span className="text-white">Jet Engine</span>
              <br />
              <span className="gradient-text-cyan">Health Monitor</span>
              <br />
              <span className="text-white">& RUL Predictor</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg text-[var(--text-muted)] leading-relaxed mb-10 max-w-xl"
            >
              Industrial-grade AI platform monitoring turbofan engine degradation in real time.
              Predict failure 200+ cycles early, automate maintenance scheduling, and reduce
              unscheduled downtime by up to 60%.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center gap-4 flex-wrap"
            >
              <Link href="/dashboard">
                <button className="btn-cyber btn-cyber-primary flex items-center gap-2 text-sm">
                  <BarChart3 className="w-4 h-4" />
                  Open Dashboard
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
              <Link href="/result">
                <button className="btn-cyber flex items-center gap-2 text-sm">
                  <Gauge className="w-4 h-4" />
                  Run Prediction
                </button>
              </Link>
              <Link href="/chat">
                <button className="btn-cyber flex items-center gap-2 text-sm opacity-80 hover:opacity-100">
                  <Bot className="w-4 h-4" />
                  Ask AI
                </button>
              </Link>
            </motion.div>

            {/* Spec strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 flex items-center gap-6 text-xs font-mono-aerospace text-[var(--text-muted)]"
            >
              <span>NASA C-MAPSS</span>
              <span className="text-[rgba(0,229,255,0.3)]">◆</span>
              <span>LSTM + Bi-LSTM</span>
              <span className="text-[rgba(0,229,255,0.3)]">◆</span>
              <span>MSG-3 Compliant</span>
              <span className="text-[rgba(0,229,255,0.3)]">◆</span>
              <span>IATA ATA Ch.72</span>
            </motion.div>
          </div>

          {/* Right: Engine HUD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative w-full lg:absolute lg:right-0 lg:w-[50vw] flex items-center justify-center min-h-[500px] z-0 pointer-events-none"
          >
            <JetEngine3D />

            {/* Floating cards Stack */}
            <div className="absolute right-4 lg:right-12 top-1/2 -translate-y-1/2 flex flex-col gap-10 z-10 pointer-events-none">
              {/* RUL Card */}
              <motion.div
                animate={{ y: [4, -4, 4] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                className="panel p-3 text-xs font-mono-aerospace min-w-[140px] pointer-events-auto"
              >
                <div className="text-[var(--text-muted)] mb-1 text-[10px] tracking-widest">RUL</div>
                <div className="text-lg font-bold" style={{ color: heroColor }}>
                  {loadingHero ? (
                    <span className="opacity-50 animate-pulse text-sm">Loading...</span>
                  ) : (
                    <>
                      {heroData?.predictedRul || "74.5"}{" "}
                      <span className="text-[var(--cyan-dim)] text-xs">cycles</span>
                    </>
                  )}
                </div>
                <div className="text-[10px] mt-1 font-bold" style={{ color: heroColor }}>
                  ● {loadingHero ? "LOADING" : (heroData?.status?.toUpperCase() || "HEALTHY")}
                </div>
              </motion.div>

              {/* VIBRATION Card */}
              <motion.div
                animate={{ y: [-4, 4, -4] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className="panel p-3 text-xs font-mono-aerospace min-w-[140px] pointer-events-auto"
              >
                <div className="text-[var(--text-muted)] text-[10px] tracking-widest">VIBRATION</div>
                <div className="text-base font-bold text-white mt-0.5">
                  0.48 <span className="text-[10px] text-[var(--cyan-dim)]">mm/s</span>
                </div>
              </motion.div>

              {/* EGT / T24 Temp Card */}
              <motion.div
                animate={{ y: [6, -6, 6] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="panel p-3 text-xs font-mono-aerospace min-w-[140px] pointer-events-auto"
              >
                <div className="text-[var(--text-muted)] mb-1 text-[10px] tracking-widest">T24 TEMP</div>
                <div className="text-lg font-bold text-white">
                  {loadingHero ? (
                    <span className="opacity-50 animate-pulse text-sm">Loading...</span>
                  ) : (
                    <>
                      {heroData?.sensors?.T24 || "616.4"}{" "}
                      <span className="text-[var(--cyan-dim)] text-xs">°R</span>
                    </>
                  )}
                </div>
                <div className="risk-bar-track mt-2">
                  <div
                    className="risk-bar-fill"
                    style={{ 
                      width: loadingHero ? "0%" : `${Math.min(100, (((heroData?.sensors?.T24 || 600) - 590) / 60) * 100)}%`,
                      background: heroColor
                    }}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--text-muted)]"
        >
          <span className="text-[10px] font-mono-aerospace tracking-[0.25em]">SCROLL</span>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.section>

      {/* ── STATS ── */}
      <section className="py-16 border-y border-[rgba(0,229,255,0.08)] bg-[rgba(6,14,31,0.5)]">
        <div className="max-w-[1300px] mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 max-w-[1300px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-[rgba(0,229,255,0.2)] bg-[rgba(0,229,255,0.04)]">
            <span className="text-[10px] font-mono-aerospace tracking-[0.2em] text-[var(--cyan-dim)]">
              PLATFORM CAPABILITIES
            </span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Industrial-Grade{" "}
            <span className="gradient-text-cyan">AI Infrastructure</span>
          </h2>
          <p className="text-[var(--text-muted)] max-w-2xl mx-auto">
            End-to-end predictive maintenance solution designed for Tier 1 MRO operations,
            airline technical operations centers, and engine OEM health management programs.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="panel p-6 hud-frame group cursor-default"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{
                  background: `rgba(${feature.color === "#00e5ff" ? "0,229,255" : feature.color === "#ffaa00" ? "255,170,0" : feature.color === "#00ff88" ? "0,255,136" : feature.color === "#8888ff" ? "136,136,255" : "0,102,255"},0.1)`,
                  border: `1px solid ${feature.color}33`,
                }}
              >
                <feature.icon className="w-5 h-5" style={{ color: feature.color }} />
              </div>
              <h3 className="font-bold text-white mb-2 text-base">{feature.title}</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TELEMETRY SHOWCASE ── */}
      <section className="py-24 max-w-[1300px] mx-auto px-6 border-t border-[rgba(0,229,255,0.08)]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-[rgba(0,229,255,0.2)] bg-[rgba(0,229,255,0.04)]">
            <span className="text-[10px] font-mono-aerospace tracking-[0.2em] text-[var(--cyan-dim)]">
              LIVE DATA DEGRADATION
            </span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            NASA C-MAPSS <span className="gradient-text-cyan">Telemetry Showcase</span>
          </h2>
          <p className="text-[var(--text-muted)] max-w-2xl mx-auto">
            Visualizing real-time degradation trends extracted from our LSTM predictions. Look closely at LPC Outlet Temperature (T24) rising and HPC Outlet Pressure (P30) declining across the 93 operational cycles.
          </p>
        </motion.div>

        {loadingTrends ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 rounded-full border-2 border-[var(--cyan-glow)] border-t-transparent animate-spin mx-auto mb-3" />
              <div className="text-xs font-mono-aerospace text-[var(--text-muted)]">LOADING SENSOR TELEMETRY TRENDS...</div>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* T24 Chart Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="panel p-6 hud-frame"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-[#ff6644]" />
                  <div>
                    <h3 className="font-bold text-white text-base">LPC Outlet Temperature (T24)</h3>
                    <p className="text-xs text-[var(--text-muted)]">Real degradation telemetry trend across cycles</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono-aerospace text-[var(--text-muted)]">Unit: </span>
                  <span className="text-xs font-mono-aerospace text-[var(--cyan-glow)]">°R</span>
                </div>
              </div>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends}>
                    <defs>
                      <linearGradient id="t24Grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff6644" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#ff6644" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="cycle" tick={{ fill: "var(--text-muted)", fontSize: 10 }} label={{ value: "Cycle", position: "insideBottom", offset: -2, fill: "var(--text-muted)", fontSize: 10 }} />
                    <YAxis domain={[590, 650]} tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="panel p-3 text-xs font-mono-aerospace border border-[rgba(255,102,68,0.3)]">
                            <div className="text-white mb-1">Cycle {data.cycle}</div>
                            <div className="text-[#ff6644]">Temp: {data.T24} °R</div>
                            <div className="text-[var(--text-muted)] mt-1">RUL: {data.rul} cyc</div>
                          </div>
                        );
                      }}
                    />
                    <Area type="monotone" dataKey="T24" stroke="#ff6644" strokeWidth={2} fill="url(#t24Grad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* P30 Chart Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="panel p-6 hud-frame"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[var(--cyan-glow)]" />
                  <div>
                    <h3 className="font-bold text-white text-base">HPC Outlet Pressure (P30)</h3>
                    <p className="text-xs text-[var(--text-muted)]">Real degradation telemetry trend across cycles</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono-aerospace text-[var(--text-muted)]">Unit: </span>
                  <span className="text-xs font-mono-aerospace text-[var(--cyan-glow)]">psia</span>
                </div>
              </div>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends}>
                    <defs>
                      <linearGradient id="p30Grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="cycle" tick={{ fill: "var(--text-muted)", fontSize: 10 }} label={{ value: "Cycle", position: "insideBottom", offset: -2, fill: "var(--text-muted)", fontSize: 10 }} />
                    <YAxis domain={[535, 565]} tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="panel p-3 text-xs font-mono-aerospace border border-[rgba(0,229,255,0.3)]">
                            <div className="text-white mb-1">Cycle {data.cycle}</div>
                            <div className="text-[var(--cyan-glow)]">Pressure: {data.P30} psia</div>
                            <div className="text-[var(--text-muted)] mt-1">RUL: {data.rul} cyc</div>
                          </div>
                        );
                      }}
                    />
                    <Area type="monotone" dataKey="P30" stroke="#00e5ff" strokeWidth={2} fill="url(#p30Grad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        )}
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-16 border-t border-[rgba(0,229,255,0.08)]">
        <div className="max-w-[1300px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-xl overflow-hidden p-12 text-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,102,255,0.15) 0%, rgba(0,229,255,0.08) 50%, rgba(102,0,255,0.1) 100%)",
              border: "1px solid rgba(0,229,255,0.2)",
            }}
          >
            <div className="absolute inset-0 bg-grid opacity-30" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Deploy Predictive Intelligence?
              </h2>
              <p className="text-[var(--text-muted)] mb-8 max-w-xl mx-auto">
                Start with the live dashboard to monitor fleet health, then run your first
                RUL prediction or query the AI assistant.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Link href="/dashboard">
                  <button className="btn-cyber btn-cyber-primary flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Open Dashboard
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
                <Link href="/about">
                  <button className="btn-cyber flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    About the Model
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(0,229,255,0.08)] py-8">
        <div className="max-w-[1300px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs font-mono-aerospace text-[var(--text-muted)] tracking-widest uppercase">
            AEROPULSE &copy; 2025 — AEROSPACE AI SYSTEMS | Built by Amit Hasan NurNabi
          </div>
          <div className="flex items-center gap-6 text-xs font-mono-aerospace text-[var(--text-muted)]">
            <span>NASA C-MAPSS</span>
            <span>LSTM v2.3</span>
            <span>MSG-3 Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full status-ok" />
            <span className="text-xs font-mono-aerospace text-[var(--success)] tracking-widest">
              ALL SYSTEMS OPERATIONAL
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
