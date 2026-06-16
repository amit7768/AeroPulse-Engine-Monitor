import { NextResponse } from "next/server";
import { getEngineStatus } from "@/lib/predictions";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const engineId = body.engineId ?? "ENG-4721-X";

    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 600));

    const statusReport = getEngineStatus(engineId);
    if (!statusReport) {
      return NextResponse.json(
        { error: `Engine ${engineId} not found` },
        { status: 404 }
      );
    }

    const { rul, status, sensors } = statusReport;

    // Generate formatted markdown decision-support message
    let analysisMessage = "";
    if (status === "Critical") {
      analysisMessage = `### ⚠️ Diagnostic Alert: **${engineId}** is in **CRITICAL** status
- **Current Cycle Remaining Useful Life (RUL):** **${rul} cycles** (Critical threshold: < 20)
- **Sensor Telemetry Snapshot:**
  - **LPC Outlet Temperature (T24):** **${sensors.T24} °R** (Severely elevated)
  - **HPC Outlet Pressure (P30):** **${sensors.P30} psia** (Significantly degraded)

**Decision-Support Recommendation:**
Ground the aircraft immediately. Initiate MSG-3 Chapter 72 mandatory shop overhaul. Bearing deterioration and compressor blade crack propagation are highly probable based on the historical LSTM degradation patterns.`;
    } else if (status === "Warning") {
      analysisMessage = `### ⚠️ Advisory Notice: **${engineId}** is under **WARNING** status
- **Current Cycle Remaining Useful Life (RUL):** **${rul} cycles** (Warning envelope: 20-50)
- **Sensor Telemetry Snapshot:**
  - **LPC Outlet Temperature (T24):** **${sensors.T24} °R** (Elevated trend detected)
  - **HPC Outlet Pressure (P30):** **${sensors.P30} psia** (Mild pressure loss)

**Decision-Support Recommendation:**
Schedule borescope inspections within 50 flight hours. Increase sensor sampling frequency and prepare MRO technical crew for scheduled high-pressure section checks.`;
    } else {
      analysisMessage = `### ✅ Fleet Status: **${engineId}** is **HEALTHY**
- **Current Cycle Remaining Useful Life (RUL):** **${rul} cycles** (Healthy envelope: > 50)
- **Sensor Telemetry Snapshot:**
  - **LPC Outlet Temperature (T24):** **${sensors.T24} °R** (Within nominal range)
  - **HPC Outlet Pressure (P30):** **${sensors.P30} psia** (Optimal pressure efficiency)

**Decision-Support Recommendation:**
Standard operating envelope confirmed. Continue routine flight cycles and monitor telemetry at the scheduled 250hr interval.`;
    }

    return NextResponse.json({
      engineId,
      rul,
      status,
      sensors,
      message: analysisMessage,
      timestamp: new Date().toISOString(),
      model: "AeroPulse-DSS-v1.0",
      confidence: 0.95,
      sources: ["NASA C-MAPSS Dataset", "AeroPulse DSS Engine"],
    });
  } catch (error) {
    console.error("Error in chatbot/analyze endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error during analysis" },
      { status: 500 }
    );
  }
}
