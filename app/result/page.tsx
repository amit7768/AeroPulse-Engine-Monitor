"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import ClientTime from "@/components/ClientTime";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Gauge,
  Info,
  Loader2,
  Shield,
  Thermometer,
  TrendingDown,
  Zap,
} from "lucide-react";

type PredictResult = {
  engineId: string;
  rul: number;
  riskScore: number;
  riskLevel: string;
  confidence: number;
  anomalyDetected: boolean;
  maintenanceWindow: string;
  recommendations: string[];
  sensorSnapshot: Record<string, number>;
  timestamp: string;
  model: string;
  datasetRef: string;
};

const RISK_COLORS = {
  low: { text: "var(--success)", border: "rgba(0,255,136,0.3)", bg: "rgba(0,255,136,0.07)", label: "LOW RISK" },
  medium: { text: "var(--warning)", border: "rgba(255,170,0,0.3)", bg: "rgba(255,170,0,0.07)", label: "MEDIUM RISK" },
  high: { text: "var(--danger)", border: "rgba(255,68,68,0.3)", bg: "rgba(255,68,68,0.07)", label: "CRITICAL RISK" },
};

const MAINT_LABELS: Record<string, string> = {
  immediate: "IMMEDIATE — Ground aircraft",
  within_50_hrs: "Within 50 Flight Hours",
  scheduled: "Standard 250hr Schedule",
};

function RiskMeter({ score }: { score: number }) {
  const level = score > 70 ? "high" : score > 40 ? "medium" : "low";
  const cfg = RISK_COLORS[level];
  const circumference = 2 * Math.PI * 60;
  const dash = (Math.min(score, 100) / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 140 140">
          {/* Track */}
          <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          {/* Zones */}
          <circle cx="70" cy="70" r="60" fill="none"
            stroke={cfg.text} strokeWidth="10"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${cfg.text})`, transition: "stroke-dasharray 1.2s ease" }}
          />
        </svg>
        <div className="z-10 text-center">
          <div className="text-5xl font-black font-mono-aerospace" style={{ color: cfg.text }}>{score}</div>
          <div className="text-[10px] text-[var(--text-muted)] tracking-widest font-mono-aerospace">/100</div>
        </div>
      </div>
      <div
        className="mt-3 px-4 py-1.5 rounded-full text-xs font-mono-aerospace tracking-widest font-bold"
        style={{ color: cfg.text, background: cfg.bg, border: `1px solid ${cfg.border}` }}
      >
        {cfg.label}
      </div>
    </div>
  );
}

function SensorPill({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="panel p-3 flex items-center justify-between gap-4">
      <span className="text-xs font-mono-aerospace text-[var(--text-muted)] tracking-wider">{label}</span>
      <span className="font-mono-aerospace font-bold text-white text-sm">
        {typeof value === "number" ? value.toLocaleString() : value}
        <span className="text-[var(--text-muted)] text-xs ml-1">{unit}</span>
      </span>
    </div>
  );
}

const SENSOR_UNITS: Record<string, [string, string]> = {
  temperature: ["EGT", "°C"],
  vibration: ["Vibration", "mm/s"],
  fanSpeedRPM: ["Fan Speed", "rpm"],
  exhaustGasTemp: ["Exhaust Temp", "°C"],
  oilPressure: ["Oil Pressure", "psi"],
};

export default function ResultPage() {
  const [engineId, setEngineId] = useState("ENG-4721-X");
  const [temperature, setTemperature] = useState(650);
  const [vibration, setVibration] = useState(0.48);
  const [pressure, setPressure] = useState(287);
  const [cycles, setCycles] = useState(500);
  const [result, setResult] = useState<PredictResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  async function runPrediction() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ engineId, temperature, vibration, pressure, cycles }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] bg-grid">
      <Navbar />

      <div className="max-w-[1200px] mx-auto px-6 pt-28 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 rounded-full border border-[rgba(0,229,255,0.25)] bg-[rgba(0,229,255,0.05)]">
            <Gauge className="w-3 h-3 text-[var(--cyan-glow)]" />
            <span className="text-[10px] font-mono-aerospace tracking-[0.2em] text-[var(--cyan-dim)]">
              PREDICTIVE MAINTENANCE ENGINE
            </span>
          </div>
          <h1 className="text-5xl font-black text-white mb-4">
            RUL <span className="gradient-text-cyan">Prediction & Risk</span> Analysis
          </h1>
          <p className="text-[var(--text-muted)] max-w-2xl">
            Input real-time sensor readings to generate an AI-powered Remaining Useful Life prediction,
            risk score, and maintenance recommendation aligned to MSG-3 standards.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-8">
          {/* Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="panel p-6 space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-[rgba(0,229,255,0.1)]">
                <Activity className="w-4 h-4 text-[var(--cyan-glow)]" />
                <span className="text-sm font-semibold text-white tracking-wide">Sensor Input Parameters</span>
              </div>

              {/* Engine ID */}
              <div>
                <label className="block text-xs font-mono-aerospace text-[var(--text-muted)] tracking-widest mb-2">
                  ENGINE IDENTIFIER
                </label>
                <input
                  type="text"
                  value={engineId}
                  onChange={(e) => setEngineId(e.target.value)}
                  className="w-full bg-[rgba(0,229,255,0.04)] border border-[rgba(0,229,255,0.2)] rounded px-4 py-2.5 text-sm font-mono-aerospace text-white focus:outline-none focus:border-[var(--cyan-glow)] transition-colors"
                  placeholder="ENG-XXXX-X"
                />
              </div>

              {/* Temperature */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono-aerospace text-[var(--text-muted)] tracking-widest flex items-center gap-1.5">
                    <Thermometer className="w-3 h-3 text-[#ff6644]" /> EGT (EXHAUST GAS TEMP)
                  </label>
                  <span className="text-sm font-bold font-mono-aerospace" style={{ color: temperature > 720 ? "var(--danger)" : temperature > 680 ? "var(--warning)" : "var(--success)" }}>
                    {temperature} °C
                  </span>
                </div>
                <input
                  type="range" min={500} max={800} step={1}
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full accent-[var(--cyan-glow)] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono-aerospace text-[var(--text-muted)] mt-1">
                  <span>500°C</span><span className="text-[var(--success)]">NOMINAL &lt;680</span><span>800°C</span>
                </div>
              </div>

              {/* Vibration */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono-aerospace text-[var(--text-muted)] tracking-widest flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-[var(--blue-accent)]" /> FAN VIBRATION
                  </label>
                  <span className="text-sm font-bold font-mono-aerospace" style={{ color: vibration > 1.2 ? "var(--danger)" : vibration > 0.7 ? "var(--warning)" : "var(--success)" }}>
                    {vibration.toFixed(2)} mm/s
                  </span>
                </div>
                <input
                  type="range" min={0} max={2.5} step={0.01}
                  value={vibration}
                  onChange={(e) => setVibration(Number(e.target.value))}
                  className="w-full accent-[var(--cyan-glow)] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono-aerospace text-[var(--text-muted)] mt-1">
                  <span>0</span><span className="text-[var(--success)]">ISO &lt;0.7</span><span>2.5</span>
                </div>
              </div>

              {/* Pressure */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono-aerospace text-[var(--text-muted)] tracking-widest">
                    HPC OUTLET PRESSURE
                  </label>
                  <span className="text-sm font-bold font-mono-aerospace" style={{ color: pressure < 220 ? "var(--danger)" : pressure < 260 ? "var(--warning)" : "var(--success)" }}>
                    {pressure} kPa
                  </span>
                </div>
                <input
                  type="range" min={100} max={350} step={1}
                  value={pressure}
                  onChange={(e) => setPressure(Number(e.target.value))}
                  className="w-full accent-[var(--cyan-glow)] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono-aerospace text-[var(--text-muted)] mt-1">
                  <span>100</span><span className="text-[var(--success)]">NOMINAL 260-320</span><span>350</span>
                </div>
              </div>

              {/* Advanced toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-xs font-mono-aerospace text-[var(--text-muted)] hover:text-[var(--cyan-glow)] transition-colors"
              >
                {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                ADVANCED PARAMETERS
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-mono-aerospace text-[var(--text-muted)] tracking-widest">
                          OPERATIONAL CYCLES
                        </label>
                        <span className="text-sm font-bold font-mono-aerospace text-white">{cycles}</span>
                      </div>
                      <input
                        type="range" min={0} max={2000} step={10}
                        value={cycles}
                        onChange={(e) => setCycles(Number(e.target.value))}
                        className="w-full accent-[var(--cyan-glow)] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] font-mono-aerospace text-[var(--text-muted)] mt-1">
                        <span>0</span><span>2000 cycles</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                onClick={runPrediction}
                disabled={loading}
                className="btn-cyber btn-cyber-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> RUNNING INFERENCE...</>
                ) : (
                  <><Gauge className="w-4 h-4" /> PREDICT RUL & RISK</>
                )}
              </button>

              <div className="flex items-start gap-2 text-[10px] font-mono-aerospace text-[var(--text-muted)]">
                <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <span>Model: AeroPulse-LSTM-v2.3 · Dataset: NASA C-MAPSS FD001 · Confidence via Monte Carlo Dropout</span>
              </div>
            </div>
          </motion.div>

          {/* Result Panel */}
          <div>
            <AnimatePresence mode="wait">
              {!result && !loading && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="panel p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]"
                >
                  <div className="w-20 h-20 rounded-full border-2 border-[rgba(0,229,255,0.2)] flex items-center justify-center mb-6">
                    <Gauge className="w-8 h-8 text-[var(--text-muted)]" />
                  </div>
                  <p className="text-[var(--text-muted)] text-sm font-mono-aerospace">
                    Configure sensor parameters and run prediction
                  </p>
                </motion.div>
              )}

              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="panel p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]"
                >
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-full border-2 border-[rgba(0,229,255,0.15)] animate-ping absolute inset-0" />
                    <div className="w-20 h-20 rounded-full border-2 border-[var(--cyan-glow)] flex items-center justify-center relative">
                      <Loader2 className="w-8 h-8 text-[var(--cyan-glow)] animate-spin" />
                    </div>
                  </div>
                  <p className="text-[var(--cyan-dim)] text-sm font-mono-aerospace tracking-widest">
                    RUNNING LSTM INFERENCE...
                  </p>
                  <p className="text-[var(--text-muted)] text-xs font-mono-aerospace mt-2">
                    Monte Carlo Dropout · T=50 passes
                  </p>
                </motion.div>
              )}

              {result && !loading && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-5"
                >
                  {/* RUL + Risk Score */}
                  <div className="panel p-6 grid grid-cols-2 gap-8">
                    <div className="text-center">
                      <div className="text-xs font-mono-aerospace text-[var(--text-muted)] tracking-widest mb-4">RUL ESTIMATE</div>
                      <div className="text-6xl font-black font-mono-aerospace gradient-text-cyan">{result.rul}</div>
                      <div className="text-[var(--text-muted)] text-sm font-mono-aerospace mt-1">operational cycles</div>
                      <div className="text-xs font-mono-aerospace text-[var(--text-muted)] mt-3">
                        Confidence: <span className="text-white">{(result.confidence * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-xs font-mono-aerospace text-[var(--text-muted)] tracking-widest mb-2">RISK SCORE</div>
                      <RiskMeter score={result.riskScore} />
                    </div>
                  </div>

                  {/* Anomaly + Maintenance Window */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="panel p-4">
                      <div className="text-[10px] font-mono-aerospace text-[var(--text-muted)] tracking-widest mb-2">ANOMALY DETECTED</div>
                      <div className="flex items-center gap-2">
                        {result.anomalyDetected ? (
                          <><AlertTriangle className="w-5 h-5 text-[var(--danger)]" />
                          <span className="font-bold text-[var(--danger)] font-mono-aerospace">YES</span></>
                        ) : (
                          <><CheckCircle className="w-5 h-5 text-[var(--success)]" />
                          <span className="font-bold text-[var(--success)] font-mono-aerospace">NO</span></>
                        )}
                      </div>
                    </div>
                    <div className="panel p-4">
                      <div className="text-[10px] font-mono-aerospace text-[var(--text-muted)] tracking-widest mb-2">MAINTENANCE WINDOW</div>
                      <div className="font-bold text-white text-xs font-mono-aerospace leading-tight">
                        {MAINT_LABELS[result.maintenanceWindow] ?? result.maintenanceWindow}
                      </div>
                    </div>
                  </div>

                  {/* Sensor Snapshot */}
                  <div className="panel p-5">
                    <div className="text-xs font-mono-aerospace text-[var(--text-muted)] tracking-widest mb-4">SENSOR SNAPSHOT</div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(result.sensorSnapshot).map(([key, val]) => {
                        const [label, unit] = SENSOR_UNITS[key] ?? [key, ""];
                        return <SensorPill key={key} label={label} value={val as number} unit={unit} />;
                      })}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="panel p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="w-4 h-4 text-[var(--cyan-glow)]" />
                      <span className="text-sm font-semibold text-white">Maintenance Recommendations</span>
                    </div>
                    <div className="space-y-2.5">
                      {result.recommendations.map((rec, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <span className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-mono-aerospace font-bold"
                            style={{
                              background: result.riskLevel === "high" ? "rgba(255,68,68,0.15)" : result.riskLevel === "medium" ? "rgba(255,170,0,0.15)" : "rgba(0,255,136,0.1)",
                              color: result.riskLevel === "high" ? "var(--danger)" : result.riskLevel === "medium" ? "var(--warning)" : "var(--success)",
                            }}>
                            {i + 1}
                          </span>
                          <span className="text-sm text-[var(--text-muted)] leading-relaxed">{rec}</span>
                        </motion.div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.04)] flex items-center justify-between text-[10px] font-mono-aerospace text-[var(--text-muted)]">
                      <span>Model: {result.model}</span>
                      <span>Ref: {result.datasetRef}</span>
                      <span><ClientTime date={result.timestamp} /></span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
