import { NextResponse } from "next/server";
import { getMappedTrends } from "@/lib/predictions";

export async function GET() {
  try {
    const trends = getMappedTrends();
    
    // Disable caching for live analytics
    return NextResponse.json(
      { trends },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Error in showcase/trends endpoint:", error);
    return NextResponse.json(
      { error: "Failed to load degradation trends" },
      { status: 500 }
    );
  }
}
