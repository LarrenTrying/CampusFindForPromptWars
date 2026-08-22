import { NextRequest, NextResponse } from "next/server";
import { UserStore } from "@/lib/auth/userStore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campus_id, password, name } = body;

    if (!campus_id || !password) {
      return NextResponse.json(
        { success: false, error: "5-digit Campus ID and password are required." },
        { status: 400 }
      );
    }

    const result = UserStore.authenticate(campus_id, password, name);

    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, error: result.error || "Authentication failed." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        campus_id: result.user.campus_id,
        name: result.user.name,
        is_admin: result.user.is_admin,
      },
      isNew: result.isNew,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Auth server error" },
      { status: 500 }
    );
  }
}
