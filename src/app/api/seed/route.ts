import { NextResponse } from "next/server";
import { MockDb } from "@/lib/db/mockDb";

export async function POST() {
  try {
    MockDb.clearAllReports();
    return NextResponse.json({
      success: true,
      message: "Database cleared of all mock reports.",
      count: 0,
      reports: [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to clear database" },
      { status: 500 }
    );
  }
}
