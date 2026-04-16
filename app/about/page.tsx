"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import {
  Activity,
  Brain,
  ChevronRight,
  Cpu,
  Database,
  FlaskConical,
  Layers,
  Network,
  Target,
  TrendingDown,
} from "lucide-react";

const TIMELINE = [
  {
    phase: "01",
    title: "Data Ingestion & Preprocessing",
    desc: "Raw NASA C-MAPSS sensor logs are ingested, normalized per unit, and windowed into 30-cycle sliding sequences. Outlier rejection and missing-value imputation are applied before feature selection.",
    icon: Database,
    color: "#00e5ff",
  },
  {
    phase: "02",
    title: "Feature Engineering",
    desc: "14 of 21 sensors are selected via mutual information ranking and correlation pruning. Health Index (HI) is constructed using moving-average degradation normalization and exponential smoothing.",
    icon: Layers,
    color: "#0066ff",
  },
  {
    phase: "03",
    title: "LSTM Model Architecture",
    desc: "Bidirectional LSTM with 2 stacked layers (128 hidden units each), dropout 0.2, trained with piece-wise linear RUL targets (125-cycle early degradation threshold). Adam optimizer, LR scheduler with warm restart.",
    icon: Brain,
    color: "#00e5ff",
  },
  {
    phase: "04",
    title: "Uncertainty Quantification",
    desc: "Monte Carlo Dropout (MCDr) with T=50 forward passes generates predictive distributions. Confidence intervals reported at 90% coverage — typically ±8 cycles at RUL > 80.",
    icon: Network,
    color: "#8888ff",
  },
  {
    phase: "05",
    title: "Risk Scoring & Alerting",
    desc: "Multi-signal composite risk index (RUL proximity 40%, anomaly count 30%, degradation rate 20%, maintenance compliance 10%) drives real-time alert tiers: Nominal → Warning → Critical.",
    icon: Target,
    color: "#ffaa00",
  },
  {
    phase: "06",
    title: "Maintenance Decision Support",
    desc: "MSG-3 and IATA ATA Chapter 72 compliant recommendations are generated per risk tier. AOG triggers initiate automated MRO work order drafting and spare parts inventory cross-check.",
    icon: FlaskConical,
    color: "#00ff88",
  },
];

const METRICS = [
  { label: "RMSE (FD001)", value: "11.2", unit: "cycles" },
  { label: "MAE", value: "8.7", unit: "cycles" },
  { label: "Score Function", value: "312", unit: "pts" },
  { label: "R² Score", value: "0.951", unit: "" },
  { label: "Recall (Early Warning)", value: "99.1", unit: "%" },
  { label: "False AOG Rate", value: "0.8", unit: "%" },
];

const TECH_STACK = [
  { name: "LSTM + Bi-LSTM", category: "Model Architecture" },
  { name: "Monte Carlo Dropout", category: "Uncertainty Quantification" },
  { name: "NASA C-MAPSS", category: "Training Dataset" },
  { name: "PyTorch 2.x", category: "Training Framework" },
  { name: "Piece-wise RUL Labeling", category: "Target Engineering" },
  { name: "Sliding Window (30 cycles)", category: "Sequence Modeling" },
  { name: "SHAP Values", category: "Explainability" },
  { name: "MSG-3 / ATA Ch.72", category: "Compliance Framework" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-dark)] bg-grid">
      <Navbar />

      <div className="max-w-[1200px] mx-auto px-6 pt-28 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 rounded-full border border-[rgba(0,229,255,0.25)] bg-[rgba(0,229,255,0.05)]">
            <Activity className="w-3 h-3 text-[var(--cyan-glow)]" />
            <span className="text-[10px] font-mono-aerospace tracking-[0.2em] text-[var(--cyan-dim)]">
              METHODOLOGY & ARCHITECTURE
            </span>
          </div>
          <h1 className="text-5xl font-black text-white mb-5 leading-tight">
            About{" "}
            <span className="gradient-text-cyan">AeroPulse AI</span>
          </h1>
          <p className="text-lg text-[var(--text-muted)] max-w-3xl leading-relaxed">
            AeroPulse is an industrial predictive maintenance system for commercial turbofan engines.
            It combines deep learning degradation modeling with domain-specific aerospace engineering
            knowledge to predict engine failures before they occur — enabling data-driven maintenance
            decisions that save lives and reduce operational costs.
          </p>
        </motion.div>

        {/* Model Performance */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <Cpu className="w-5 h-5 text-[var(--cyan-glow)]" />
            Model Performance Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {METRICS.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="panel p-4 text-center"
              >
                <div className="text-2xl font-bold font-mono-aerospace gradient-text-cyan">
                  {m.value}
                  {m.unit && (
                    <span className="text-xs text-[var(--text-muted)] ml-1">{m.unit}</span>
                  )}
                </div>
                <div className="text-[10px] font-mono-aerospace text-[var(--text-muted)] mt-2 tracking-widest uppercase">
                  {m.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Pipeline Timeline */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-2xl font-bold text-white mb-10 flex items-center gap-3">
            <TrendingDown className="w-5 h-5 text-[var(--cyan-glow)]" />
            AI Pipeline Architecture
          </h2>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-7 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--cyan-glow)] via-[rgba(0,102,255,0.4)] to-transparent" />

            <div className="space-y-6">
              {TIMELINE.map((step, i) => (
                <motion.div
                  key={step.phase}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="relative flex gap-6"
                >
                  {/* Circle node */}
                  <div
                    className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `rgba(${step.color === "#00e5ff" ? "0,229,255" : step.color === "#0066ff" ? "0,102,255" : step.color === "#ffaa00" ? "255,170,0" : step.color === "#00ff88" ? "0,255,136" : step.color === "#8888ff" ? "136,136,255" : "0,229,255"},0.1)`,
                      border: `2px solid ${step.color}44`,
                    }}
                  >
                    <step.icon className="w-5 h-5" style={{ color: step.color }} />
                  </div>

                  {/* Content */}
                  <div className="panel p-5 flex-1 group hover:-translate-y-1 transition-transform duration-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span
                          className="text-[10px] font-mono-aerospace tracking-[0.2em] mr-3"
                          style={{ color: step.color }}
                        >
                          PHASE {step.phase}
                        </span>
                        <h3 className="font-bold text-white text-base mt-1">{step.title}</h3>
                      </div>
                      <ChevronRight
                        className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--cyan-glow)] transition-colors mt-1"
                      />
                    </div>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Tech Stack */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <Network className="w-5 h-5 text-[var(--cyan-glow)]" />
            Technology Stack
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TECH_STACK.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="panel p-4 hover:border-[rgba(0,229,255,0.4)] transition-colors duration-200"
              >
                <div className="text-[10px] font-mono-aerospace text-[var(--text-muted)] tracking-widest mb-1">
                  {tech.category}
                </div>
                <div className="text-sm font-semibold text-[var(--cyan-glow)]">{tech.name}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
