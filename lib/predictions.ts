import fs from "fs";
import path from "path";

export interface PredictionEntry {
  Actual: number;
  Predicted: number;
}

export interface MappedEntry {
  cycle: number;
  rul: number;
  predictedRul: number;
  T24: number;
  P30: number;
}

export function getPredictionsData(): PredictionEntry[] {
  const filePath = path.join(process.cwd(), "engine_predictions.json");
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Failed to read engine_predictions.json:", error);
    return [];
  }
}

export function getMappedTrends(): MappedEntry[] {
  const data = getPredictionsData();
  // The data has 93 points, representing a degradation trend over 93 cycles.
  // We map them so cycle 1 corresponds to highest actual RUL (137)
  // and cycle 93 corresponds to lowest actual RUL (7).
  return data.map((item, index) => {
    const cycle = index + 1;
    const rulItem = data[data.length - 1 - index];
    const rul = rulItem.Actual;
    
    // T24: LPC Outlet Temp (°R). Starts at ~602, degrades (rises) to ~642.
    const T24 = parseFloat((641.8 - (rul / 137) * 40).toFixed(2));
    
    // P30: HPC Outlet Pressure (psia). Starts at ~552, degrades (falls) to ~541.
    const P30 = parseFloat((541.2 + (rul / 137) * 11).toFixed(2));
    
    return {
      cycle,
      rul,
      predictedRul: parseFloat(rulItem.Predicted.toFixed(2)),
      T24,
      P30,
    };
  });
}

export function getEngineStatus(engineId: string) {
  const trends = getMappedTrends();
  if (trends.length === 0) {
    return {
      engineId,
      rul: 0,
      predictedRul: 0,
      status: "Critical" as const,
      sensors: { T24: 0, P30: 0 },
    };
  }
  
  let index = 0;
  if (engineId === "ENG-0897-C") {
    // Critical (RUL < 20): RUL = 7 (first item in data, which is index 92 in trends if reversed, i.e., cycle 93)
    index = trends.findIndex(t => t.rul < 20);
    if (index === -1) index = trends.length - 1;
  } else if (engineId === "ENG-3310-B") {
    // Warning (RUL 20 to 50): RUL = 37 (index 26 in data, which is index 66 in trends)
    index = trends.findIndex(t => t.rul >= 20 && t.rul <= 50);
    if (index === -1) index = Math.floor(trends.length / 2);
  } else if (engineId === "ENG-4721-X") {
    // Healthy (RUL > 50): RUL = 87 (index 50 in data, which is index 42 in trends)
    index = trends.findIndex(t => t.rul > 80 && t.rul < 100);
    if (index === -1) index = Math.floor(trends.length / 3);
  } else if (engineId === "ENG-5521-D") {
    // Healthy (RUL > 50): RUL = 137 (index 92 in data, which is index 0 in trends)
    index = 0;
  } else {
    // Dynamic mapping for any other engine ID using character code hashing
    let hash = 0;
    for (let i = 0; i < engineId.length; i++) {
      hash += engineId.charCodeAt(i);
    }
    index = hash % trends.length;
  }
  
  const data = trends[index];
  
  let status: "Healthy" | "Warning" | "Critical" = "Healthy";
  if (data.rul > 50) {
    status = "Healthy";
  } else if (data.rul >= 20 && data.rul <= 50) {
    status = "Warning";
  } else {
    status = "Critical";
  }
  
  return {
    engineId,
    rul: data.rul,
    predictedRul: data.predictedRul,
    status,
    sensors: {
      T24: data.T24,
      P30: data.P30,
    },
  };
}
