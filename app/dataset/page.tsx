"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import {
  Activity,
  AlertCircle,
  BookOpen,
  Database,
  Info,
  Layers,
  Settings,
  Thermometer,
} from "lucide-react";

const SENSORS = [
  { id: "T2", name: "Total temperature at fan inlet", unit: "°R", category: "Temperature", health: "nominal" },
  { id: "T24", name: "Total temperature at LPC outlet", unit: "°R", category: "Temperature", health: "nominal" },
  { id: "T30", name: "Total temperature at HPC outlet", unit: "°R", category: "Temperature", health: "warning" },
  { id: "T50", name: "Total temperature at LPT outlet", unit: "°R", category: "Temperature", health: "nominal" },
  { id: "P2", name: "Pressure at fan inlet", unit: "psia", category: "Pressure", health: "nominal" },
  { id: "P15", name: "Total pressure in bypass-duct", unit: "psia", category: "Pressure", health: "nominal" },
  { id: "P30", name: "Total pressure at HPC outlet", unit: "psia", category: "Pressure", health: "critical" },
  { id: "Nf", name: "Physical fan speed", unit: "rpm", category: "Speed", health: "nominal" },
  { id: "Nc", name: "Physical core speed", unit: "rpm", category: "Speed", health: "nominal" },
  { id: "epr", name: "Engine pressure ratio", unit: "–", category: "Ratio", health: "nominal" },
  { id: "Ps30", name: "Static pressure at HPC outlet", unit: "psia", category: "Pressure", health: "warning" },
  { id: "phi", name: "Ratio of fuel flow to Ps30", unit: "pps/psi", category: "Fuel", health: "nominal" },
  { id: "NRf", name: "Corrected fan speed", unit: "rpm", category: "Speed", health: "nominal" },
  { id: "NRc", name: "Corrected core speed", unit: "rpm", category: "Speed", health: "nominal" },
  { id: "BPR", name: "Bypass ratio", unit: "–", category: "Ratio", health: "nominal" },
  { id: "farB", name: "Burner fuel-air ratio", unit: "–", category: "Fuel", health: "nominal" },
  { id: "htBleed", name: "Bleed enthalpy", unit: "–", category: "Bleed", health: "nominal" },
  { id: "Nf_dmd", name: "Demanded fan speed", unit: "rpm", category: "Speed", health: "nominal" },
  { id: "PCNfR_dmd", name: "Demanded corrected fan speed", unit: "rpm", category: "Speed", health: "nominal" },
  { id: "W31", name: "HPT coolant bleed", unit: "lbm/s", category: "Bleed", health: "nominal" },
  { id: "W32", name: "LPT coolant bleed", unit: "lbm/s", category: "Bleed", health: "nominal" },
];

const SELECTED_SENSORS = ["T30", "T50", "P30", "Ps30", "phi", "NRf", "NRc", "BPR", "farB", "htBleed", "W31", "W32", "Nf", "Nc"];

const DATASETS = [
  {
    id: "FD001",
    faultMode: "HPC Degradation",
    conditions: "Single (Sea Level)",
    trainEngines: 100,
    testEngines: 100,
    maxRUL: 362,
    used: true,
    status: "PRIMARY",
  },
  {
    id: "FD002",
    faultMode: "HPC Degradation",
    conditions: "Six Operating Conditions",
    trainEngines: 260,
    testEngines: 259,
    maxRUL: 378,
    used: false,
    status: "SECONDARY",
  },
  {
    id: "FD003",
    faultMode: "Fan + HPC Degradation",
    conditions: "Single (Sea Level)",
    trainEngines: 100,
    testEngines: 100,
    maxRUL: 525,
    used: false,
    status: "RESEARCH",
  },
  {
    id: "FD004",
    faultMode: "Fan + HPC Degradation",
    conditions: "Six Operating Conditions",
    trainEngines: 248,
    testEngines: 249,
    maxRUL: 543,
    used: false,
    status: "RESEARCH",
  },
];

const statusColor: Record<string, string> = {
  nominal: "var(--success)",
  warning: "var(--warning)",
  critical: "var(--danger)",
};

const categoryColor: Record<string, string> = {
  Temperature: "#ff6644",
  Pressure: "#00e5ff",
  Speed: "#0066ff",
  Ratio: "#aa88ff",
  Fuel: "#ffaa00",
  Bleed: "#00ff88",
};

export default function DatasetPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-dark)] bg-grid">
      <Navbar />

      <div className="max-w-[1300px] mx-auto px-6 pt-28 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 rounded-full border border-[rgba(0,229,255,0.25)] bg-[rgba(0,229,255,0.05)]">
            <Database className="w-3 h-3 text-[var(--cyan-glow)]" />
            <span className="text-[10px] font-mono-aerospace tracking-[0.2em] text-[var(--cyan-dim)]">
              NASA C-MAPSS TURBOFAN DATASET
            </span>
          </div>
          <h1 className="text-5xl font-black text-white mb-5">
            Sensor <span className="gradient-text-cyan">Data Reference</span>
          </h1>
          <p className="text-lg text-[var(--text-muted)] max-w-3xl leading-relaxed">
            AeroPulse is trained on the NASA Commercial Modular Aero-Propulsion System Simulation
            (C-MAPSS) dataset — the industry-standard benchmark for turbofan engine prognostics.
            All 21 sensor channels are listed below, along with the 14 selected for model training.
          </p>
        </motion.div>

        {/* Dataset variants table */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <Layers className="w-5 h-5 text-[var(--cyan-glow)]" />
            C-MAPSS Sub-datasets
          </h2>
          <div className="panel overflow-hidden">
            <table className="w-full aerospace-table">
              <thead>
                <tr>
                  <th className="text-left">Dataset</th>
                  <th className="text-left">Fault Mode</th>
                  <th className="text-left">Op. Conditions</th>
                  <th className="text-right">Train Units</th>
                  <th className="text-right">Test Units</th>
                  <th className="text-right">Max RUL</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {DATASETS.map((ds, i) => (
                  <motion.tr
                    key={ds.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <td>
                      <span className="font-mono-aerospace font-bold text-white">{ds.id}</span>
                      {ds.used && (
                        <span className="ml-2 text-[10px] font-mono-aerospace text-[var(--cyan-glow)] bg-[rgba(0,229,255,0.1)] px-1.5 py-0.5 rounded">
                          PRIMARY
                        </span>
                      )}
                    </td>
                    <td className="text-[var(--text-muted)]">{ds.faultMode}</td>
                    <td className="text-[var(--text-muted)]">{ds.conditions}</td>
                    <td className="text-right font-mono-aerospace">{ds.trainEngines}</td>
                    <td className="text-right font-mono-aerospace">{ds.testEngines}</td>
                    <td className="text-right font-mono-aerospace text-[var(--cyan-dim)]">
                      {ds.maxRUL}
                    </td>
                    <td className="text-center">
                      <span
                        className={`text-[10px] font-mono-aerospace tracking-wider px-2 py-0.5 rounded-full ${
                          ds.used
                            ? "bg-[rgba(0,229,255,0.1)] text-[var(--cyan-glow)] border border-[rgba(0,229,255,0.25)]"
                            : "bg-[rgba(255,255,255,0.04)] text-[var(--text-muted)] border border-[rgba(255,255,255,0.08)]"
                        }`}
                      >
                        {ds.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Sensor catalogue */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Thermometer className="w-5 h-5 text-[var(--cyan-glow)]" />
              Sensor Catalogue — All 21 Parameters
            </h2>
            <div className="flex items-center gap-3 text-xs font-mono-aerospace">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--cyan-glow)]" />
                <span className="text-[var(--text-muted)]">Selected (14)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[rgba(255,255,255,0.2)]" />
                <span className="text-[var(--text-muted)]">Excluded</span>
              </span>
            </div>
          </div>

          <div className="grid gap-2">
            {SENSORS.map((sensor, i) => {
              const selected = SELECTED_SENSORS.includes(sensor.id);
              return (
                <motion.div
                  key={sensor.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(i * 0.03, 0.5) }}
                  className={`panel p-3 flex items-center gap-4 transition-all duration-200 ${
                    selected
                      ? "border-[rgba(0,229,255,0.2)] hover:border-[rgba(0,229,255,0.35)]"
                      : "border-[rgba(255,255,255,0.04)] opacity-50"
                  }`}
                >
                  {/* Sensor ID */}
                  <div className="w-14 flex-shrink-0">
                    <span className="font-mono-aerospace font-bold text-sm" style={{ color: selected ? "var(--cyan-glow)" : "var(--text-muted)" }}>
                      {sensor.id}
                    </span>
                  </div>

                  {/* Category pill */}
                  <div className="w-24 flex-shrink-0">
                    <span
                      className="text-[10px] font-mono-aerospace px-2 py-0.5 rounded"
                      style={{
                        color: categoryColor[sensor.category] ?? "var(--text-muted)",
                        background: `${categoryColor[sensor.category] ?? "rgba(255,255,255,0.1)"}18`,
                      }}
                    >
                      {sensor.category}
                    </span>
                  </div>

                  {/* Name */}
                  <div className="flex-1 text-sm text-[var(--text-muted)]">{sensor.name}</div>

                  {/* Unit */}
                  <div className="w-20 text-right font-mono-aerospace text-xs text-[var(--text-muted)]">
                    {sensor.unit}
                  </div>

                  {/* Status dot */}
                  <div className="w-20 flex items-center justify-end gap-1.5">
                    {selected ? (
                      <>
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: statusColor[sensor.health] }}
                        />
                        <span
                          className="text-[10px] font-mono-aerospace uppercase"
                          style={{ color: statusColor[sensor.health] }}
                        >
                          {sensor.health}
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] font-mono-aerospace text-[var(--text-muted)] opacity-50">
                        excluded
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="panel p-6 flex gap-4"
        >
          <Info className="w-5 h-5 text-[var(--cyan-glow)] flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-white mb-1">About NASA C-MAPSS</div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              The C-MAPSS dataset was generated using a thermodynamic simulation of a twin-shaft,
              separate-flow, high-bypass, turbofan engine. Each engine starts with unknown initial
              wear and manufacturing variation, and degrades until failure. The dataset defines
              failure as system exceeding a pre-specified operational envelope. Training sets
              include run-to-failure trajectories; test sets end prior to failure, and the task
              is to predict RUL for the point of truncation.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-[var(--cyan-dim)]" />
              <span className="text-xs font-mono-aerospace text-[var(--cyan-dim)]">
                Saxena, A. et al. (2008). "Damage Propagation Modeling for Aircraft Engine Run-to-Failure Simulation." IJPHM.
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
