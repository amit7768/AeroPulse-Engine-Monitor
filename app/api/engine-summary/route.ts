import { NextResponse } from "next/server";

function generateSensorHistory(
  baseValue: number,
  points: number,
  variance: number,
  trend: number
) {
  return Array.from({ length: points }, (_, i) => {
    const noise = (Math.random() - 0.5) * variance;
    const degradation = trend * i;
    return parseFloat((baseValue + degradation + noise).toFixed(2));
  });
}

function generateTimestamps(points: number) {
  const now = Date.now();
  const interval = 15 * 60 * 1000; // 15-minute intervals
  return Array.from({ length: points }, (_, i) =>
    new Date(now - (points - 1 - i) * interval).toISOString()
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const engineId = searchParams.get("engineId") ?? "ENG-4721-X";
  const points = parseInt(searchParams.get("points") ?? "48");

  await new Promise((r) => setTimeout(r, 300));

  const timestamps = generateTimestamps(points);

  const engineProfiles: Record<
    string,
    {
      tempBase: number;
      vibBase: number;
      pressBase: number;
      rul: number;
      status: string;
    }
  > = {
    "ENG-4721-X": { tempBase: 645, vibBase: 0.48, pressBase: 287, rul: 92, status: "nominal" },
    "ENG-3310-B": { tempBase: 702, vibBase: 0.91, pressBase: 261, rul: 41, status: "warning" },
    "ENG-0897-C": { tempBase: 728, vibBase: 1.38, pressBase: 243, rul: 18, status: "critical" },
    "ENG-5521-D": { tempBase: 631, vibBase: 0.32, pressBase: 296, rul: 117, status: "nominal" },
  };

  const profile = engineProfiles[engineId] ?? engineProfiles["ENG-4721-X"];

  return NextResponse.json({
    engineId,
    status: profile.status,
    rul: profile.rul,
    lastUpdated: new Date().toISOString(),
    fleetEngines: Object.entries(engineProfiles).map(([id, p]) => ({
      id,
      rul: p.rul,
      status: p.status,
    })),
    sensors: {
      temperature: {
        label: "Exhaust Gas Temperature",
        unit: "°C",
        current: profile.tempBase,
        nominal: [580, 680],
        warning: [680, 720],
        critical: [720, 800],
        history: generateSensorHistory(profile.tempBase, points, 8, 0.04),
        timestamps,
      },
      vibration: {
        label: "Fan Vibration",
        unit: "mm/s",
        current: profile.vibBase,
        nominal: [0, 0.7],
        warning: [0.7, 1.2],
        critical: [1.2, 2.5],
        history: generateSensorHistory(profile.vibBase, points, 0.05, 0.002),
        timestamps,
      },
      pressure: {
        label: "High-Pressure Compressor Outlet",
        unit: "kPa",
        current: profile.pressBase,
        nominal: [260, 320],
        warning: [220, 260],
        critical: [150, 220],
        history: generateSensorHistory(profile.pressBase, points, 4, -0.02),
        timestamps,
      },
      oilPressure: {
        label: "Oil Pressure",
        unit: "PSI",
        current: Math.round(profile.pressBase * 0.28),
        nominal: [60, 95],
        warning: [45, 60],
        critical: [0, 45],
        history: generateSensorHistory(profile.pressBase * 0.28, points, 3, -0.01),
        timestamps,
      },
      n1Speed: {
        label: "N1 Fan Speed",
        unit: "% RPM",
        current: parseFloat((88.5 - (profile.vibBase - 0.3) * 10).toFixed(2)),
        nominal: [82, 96],
        warning: [75, 82],
        critical: [0, 75],
        history: generateSensorHistory(88.5 - (profile.vibBase - 0.3) * 10, points, 0.5, -0.005),
        timestamps,
      },
    },
    degradationCurve: {
      predicted: Array.from({ length: 40 }, (_, i) => ({
        cycle: i * 5,
        rul: Math.max(0, profile.rul - i * 2.5 + (Math.random() - 0.5) * 3),
        lowerBound: Math.max(0, profile.rul - i * 2.5 - 8),
        upperBound: Math.max(0, profile.rul - i * 2.5 + 8),
      })),
    },
    maintenanceHistory: [
      { date: "2025-11-14", type: "A-Check", notes: "Routine inspection completed" },
      { date: "2025-08-02", type: "B-Check", notes: "HPC blade blending performed" },
      { date: "2025-04-17", type: "A-Check", notes: "Oil system flush & filter change" },
    ],
  });
}
