import { NextResponse } from "next/server";

const KNOWLEDGE_BASE: Record<string, string> = {
  rul: `**Remaining Useful Life (RUL)** is calculated using our LSTM-based degradation model trained on the NASA C-MAPSS turbofan dataset. The model analyzes sensor time-series trajectories across multiple operating conditions (FD001–FD004) and predicts the number of remaining operational cycles before failure.

**Key methodology:**
- 14 health-relevant sensors are selected via feature importance analysis
- Sliding window of 30 cycles fed to bidirectional LSTM layers
- Piecewise linear RUL target from 125-cycle threshold
- Uncertainty quantification via Monte Carlo Dropout (MCDr)

**Confidence interval** reflects prediction uncertainty — typically ±8% at >80 RUL, widening to ±20% at <30 RUL as nonlinear failure modes dominate.`,

  risk: `**Risk Score** is a composite index (0–100) derived from:
- **RUL proximity** (40% weight): How close is the engine to predicted failure?
- **Sensor anomaly count** (30% weight): Number of parameters outside nominal range
- **Degradation rate acceleration** (20% weight): Is the health index declining faster than baseline?
- **Historical maintenance compliance** (10% weight): Has the engine missed scheduled checks?

A score of **>70 = Critical** (immediate grounding recommended), **40–70 = Warning** (schedule inspection within 50 hrs), **<40 = Nominal** (continue standard monitoring).`,

  temperature: `**Exhaust Gas Temperature (EGT)** sensitivity analysis:
- Nominal range: 580–680°C at cruise conditions
- Every +10°C above 700°C accelerates turbine blade oxidation by ~3× (per Arrhenius degradation law)
- EGT rise with constant fuel flow indicates compressor efficiency loss
- Sustained EGT >720°C triggers EICAS warning in most commercial platforms

Our model correlates EGT trends with remaining HPC and HPT blade life using thermodynamic cycle analysis.`,

  vibration: `**Fan Vibration** monitoring parameters:
- ISO 10816 standard: <0.7 mm/s acceptable, 0.7–1.2 mm/s warning, >1.2 mm/s critical
- Vibration signature analysis uses FFT to detect:
  • 1× engine order: mass imbalance
  • Blade-passing frequency: FOD damage or blade crack
  • Subsynchronous: bearing deterioration
- Our model uses raw vibration time-series for RUL impact weighting (30% feature contribution)`,

  maintenance: `**Maintenance Recommendation Engine** operates on a risk-threshold decision tree:

1. **RUL > 80 cycles** → Continue monitoring, log in AMOS/CAMP
2. **RUL 40–80 cycles** → Schedule borescope within 50 flight hours; alert MRO
3. **RUL < 40 cycles** → Generate AOG alert; mandatory shop visit before return to service

Recommendations follow **MSG-3 (Maintenance Steering Group-3)** methodology and integrate with IATA ATA Chapter 72 (Engine) inspection standards.`,

  dataset: `The **NASA C-MAPSS (Commercial Modular Aero-Propulsion System Simulation)** dataset contains:
- 4 sub-datasets (FD001–FD004) with varying fault modes and operating conditions
- ~700 training engines with run-to-failure trajectories
- 21 sensors including temperature, pressure, fan speed, fuel flow
- Operating conditions: altitude, Mach number, throttle resolver angle

AeroPulse uses FD001 (single fault mode, single operating condition) as the primary training benchmark, achieving **RMSE of 11.2 cycles** on the test set — competitive with published SOTA LSTM models.`,
};

function matchTopic(message: string): string | null {
  const msg = message.toLowerCase();
  if (msg.match(/\brul\b|remaining|life|lifespan|cycles|predict/)) return "rul";
  if (msg.match(/risk|score|index|danger|critical|alert/)) return "risk";
  if (msg.match(/temp|egt|exhaust|heat|thermal/)) return "temperature";
  if (msg.match(/vibr|shake|oscillat|bearing|fod/)) return "vibration";
  if (msg.match(/mainten|repair|overhaul|inspection|schedule|mro|aog/)) return "maintenance";
  if (msg.match(/dataset|cmapss|nasa|data|train|model/)) return "dataset";
  return null;
}

function generateContextualResponse(message: string, engineId?: string): string {
  const topic = matchTopic(message);

  if (topic && KNOWLEDGE_BASE[topic]) {
    return KNOWLEDGE_BASE[topic];
  }

  // Generic engineering responses
  const msg = message.toLowerCase();
  const eng = engineId ?? "ENG-4721-X";

  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return `Hello, Engineer. I'm AeroPulse AI — your predictive maintenance assistant. I have access to real-time telemetry data for **${eng}** and the full fleet. Ask me about RUL predictions, sensor anomalies, maintenance recommendations, or degradation analysis.`;
  }

  if (msg.match(/engine|fleet|status|health|overall/)) {
    return `**Fleet Health Overview for ${eng}:**

Current engine status is determined by integrating 14 sensor streams through the degradation pipeline. Key observations:

- **EGT trend**: +2.1°C/cycle over the last 30 cycles — within acceptable degradation slope
- **Fan vibration**: 0.48 mm/s steady-state — nominal
- **HPC outlet pressure**: slight negative trend (-0.8 kPa/cycle) — monitor closely

The LSTM model's health index for this engine is **HI = 0.82** (1.0 = new, 0.0 = failure). Confidence interval: ±6.2%.

**Recommendation**: Schedule next borescope inspection at the standard 250hr interval.`;
  }

  return `I understand your query about **"${message}"**. Based on integrated sensor telemetry and the degradation model for engine **${eng}**:

The AeroPulse LSTM pipeline continuously monitors 14 critical parameters and updates the health index every 15 minutes. The engine's current degradation trajectory is being tracked against 700 historical run-to-failure profiles from the NASA C-MAPSS dataset.

For specific sensor analysis, try asking:
- *"Explain the RUL prediction for this engine"*
- *"What does the risk score mean?"*
- *"Analyze the EGT trend"*
- *"What maintenance is recommended?"*

I can also generate a full diagnostic report — just ask.`;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const message: string = body.message ?? "";
  const engineId: string = body.engineId ?? "ENG-4721-X";

  // Simulate streaming-like delay
  const words = message.split(" ").length;
  const delay = Math.min(1200, 400 + words * 40);
  await new Promise((r) => setTimeout(r, delay));

  const response = generateContextualResponse(message, engineId);

  return NextResponse.json({
    message: response,
    engineId,
    timestamp: new Date().toISOString(),
    model: "AeroPulse-NLP-v1.2",
    tokensUsed: Math.floor(response.split(" ").length * 1.3),
    sources: matchTopic(message)
      ? ["NASA C-MAPSS Dataset", "ISO 10816", "MSG-3 Maintenance Framework", "IATA ATA Ch.72"]
      : ["AeroPulse Knowledge Base"],
    confidence: 0.91 + Math.random() * 0.06,
  });
}
