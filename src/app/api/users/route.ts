import { NextRequest, NextResponse } from "next/server";
import { UserStore } from "@/lib/auth/userStore";

export async function GET(request: NextRequest) {
  try {
    const users = UserStore.getAllUsersWithStats();
    return NextResponse.json({
      success: true,
      total_users: users.length,
      users,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch users directory" },
      { status: 500 }
    );
  }
}
