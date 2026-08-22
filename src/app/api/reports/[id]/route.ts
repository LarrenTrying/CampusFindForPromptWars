import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase, isServerSupabaseConfigured } from "@/lib/supabase/server";
import { MockDb } from "@/lib/db/mockDb";
import { UserStore, ADMIN_ID, ADMIN_PASSWORD } from "@/lib/auth/userStore";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (isServerSupabaseConfigured()) {
      const supabase = getServerSupabase();
      if (supabase) {
        const { data, error } = await supabase
          .from("reports")
          .select("*")
          .eq("id", id)
          .single();

        if (!error && data) {
          return NextResponse.json({ success: true, report: data });
        }
      }
    }

    const report = MockDb.getReportById(id);
    if (!report) {
      return NextResponse.json(
        { success: false, error: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error fetching report" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const status = body.status;
    const campusId = (body.campus_id || body.reporter_campus_id || "").toString().trim();
    const password = (body.password || body.pin || body.passkey || "").toString().trim();

    if (!["active", "matched", "resolved"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status value" },
        { status: 400 }
      );
    }

    // 1. Fetch current report
    let currentReport = MockDb.getReportById(id);
    if (isServerSupabaseConfigured()) {
      const supabase = getServerSupabase();
      if (supabase) {
        const { data } = await supabase.from("reports").select("*").eq("id", id).single();
        if (data) currentReport = data;
      }
    }

    if (!currentReport) {
      return NextResponse.json(
        { success: false, error: "Report not found" },
        { status: 404 }
      );
    }

    // 2. Authorize via UserStore
    const isAuthenticatedSession = Boolean(body.is_authenticated || body.session_verified);
    const verification = UserStore.verifyForResolution(
      campusId,
      password,
      currentReport.reporter_campus_id,
      isAuthenticatedSession
    );

    if (!verification.authorized) {
      return NextResponse.json(
        {
          success: false,
          error: verification.error || "Unauthorized to resolve this report.",
        },
        { status: 403 }
      );
    }

    const authorizedBy = verification.authorizedBy || "Verified Authority";

    // 3. Update status in Database
    if (isServerSupabaseConfigured()) {
      const supabase = getServerSupabase();
      if (supabase) {
        const { data, error } = await supabase
          .from("reports")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("id", id)
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({
            success: true,
            report: data,
            authorized_by: authorizedBy,
          });
        }
      }
    }

    const updated = MockDb.updateReportStatus(id, status);
    return NextResponse.json({
      success: true,
      report: updated,
      authorized_by: authorizedBy,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error updating report" },
      { status: 500 }
    );
  }
}
