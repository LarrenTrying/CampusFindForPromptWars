import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase, isServerSupabaseConfigured } from "@/lib/supabase/server";
import { MockDb } from "@/lib/db/mockDb";

const ADMIN_EMAILS = [
  "campusadmin@gmail.com",
  "admin@campus.edu",
  "admin@gmail.com",
  "lostandfound@campus.edu",
  "admin",
  "campusadmin",
];

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
    const userEmail = (body.email || body.reporter_email || body.campus_id || "").toString().trim().toLowerCase();
    const passkey = (body.passkey || body.pin || "").toString().trim().toLowerCase();

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

    // 2. Authorization Verification
    // Condition A: Campus Admin Email or Admin Key
    const isAdmin =
      ADMIN_EMAILS.some((adm) => userEmail && userEmail.includes(adm)) ||
      ADMIN_EMAILS.some((adm) => passkey && passkey.includes(adm)) ||
      userEmail === "43554" ||
      passkey === "43554";

    // Condition B: Reporter Google Mail / Contact match
    const reporterEmail = (currentReport.reporter_email || currentReport.contact_info || "").toLowerCase();
    const isReporterMatch =
      userEmail &&
      (reporterEmail.includes(userEmail) || userEmail.includes(reporterEmail.split("@")[0]));

    const isAuthorized = isAdmin || isReporterMatch;

    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          error: `Unauthorized: This report can only be resolved by the original owner (${
            currentReport.reporter_email || currentReport.contact_info || "Original Reporter"
          }) or the Campus Administrator.`,
        },
        { status: 403 }
      );
    }

    // 3. Update status in Database
    const authorizedBy = isAdmin
      ? "Campus Administrator"
      : `Verified Reporter (${userEmail || "Google Account"})`;

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
