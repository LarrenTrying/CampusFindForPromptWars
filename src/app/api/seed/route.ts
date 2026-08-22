import { NextResponse } from "next/server";
import { MockDb } from "@/lib/db/mockDb";

export async function POST() {
  try {
    const refreshed = MockDb.resetToSeedData();
    return NextResponse.json({
      success: true,
      message: "Database successfully populated with realistic paired lost & found cases!",
      count: refreshed.length,
      reports: refreshed,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to seed database" },
      { status: 500 }
    );
  }
}
