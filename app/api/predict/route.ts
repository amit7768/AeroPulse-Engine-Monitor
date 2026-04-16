import { NextResponse } from "next/server";

const RECOMMENDATIONS: Record<string, string[]> = {
  low: [
    "Continue standard monitoring cycle at 250hr intervals",
    "Log fan blade inspection data at next scheduled maintenance",
    "Verify hydraulic fluid levels remain within nominal range",
  ],
  medium: [
    "Schedule borescope inspection within 50 flight hours",
    "Increase vibration sensor sampling frequency to 10Hz",
    "Review high-pressure compressor blade wear metrics",
    "Alert MRO team for precautionary parts inventory review",
  ],
  high: [
    "IMMEDIATE: Ground aircraft pending full engine overhaul inspection",
    "Deploy borescope inspection team — core engine & turbine section",
    "Initiate expedited parts requisition: HPC blades, combustor liners",
    "File AOG (Aircraft On Ground) maintenance report",
    "Cross-check against fleet-wide trend data for systemic failure patterns",
  ],
};

function getRisk(rul: number) {
  if (rul > 80) return "low";
  if (rul > 40) return "medium";
  return "high";
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // Simulate processing delay
  await new Promise((r) => setTimeout(r, 600));

  const temperature = body.temperature ?? 650;
  const vibration = body.vibration ?? 0.5;
  const pressure = body.pressure ?? 280;
  const cycles = body.cycles ?? 500;
  const engineId = body.engineId ?? "ENG-4721-X";

  // Deterministic mock RUL formula
  const degradationFactor =
    ((temperature - 600) / 200) * 0.35 +
    (vibration / 2) * 0.3 +
    ((350 - pressure) / 150) * 0.2 +
    (cycles / 2000) * 0.15;

  const baseRUL = Math.max(5, Math.round(130 - degradationFactor * 130));
  const rul = baseRUL + Math.floor(Math.random() * 10 - 5);
  const riskScore = Math.min(100, Math.round(100 - rul));
  const riskLevel = getRisk(rul);
  const confidence = 0.87 + Math.random() * 0.08;

  return NextResponse.json({
    engineId,
    rul: Math.max(5, rul),
    riskScore,
    riskLevel,
    confidence: parseFloat(confidence.toFixed(3)),
    anomalyDetected: riskLevel !== "low",
    maintenanceWindow: riskLevel === "high" ? "immediate" : riskLevel === "medium" ? "within_50_hrs" : "scheduled",
    recommendations: RECOMMENDATIONS[riskLevel],
    sensorSnapshot: {
      temperature,
      vibration: parseFloat(vibration.toFixed(3)),
      fanSpeedRPM: Math.round(12000 - vibration * 500),
      exhaustGasTemp: Math.round(temperature * 0.85),
      oilPressure: Math.round(pressure * 0.3),
    },
    timestamp: new Date().toISOString(),
    model: "AeroPulse-LSTM-v2.3",
    datasetRef: "NASA C-MAPSS FD001",
  });
}
