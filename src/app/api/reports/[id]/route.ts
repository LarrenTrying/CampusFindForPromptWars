import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase, isServerSupabaseConfigured } from "@/lib/supabase/server";
import { MockDb } from "@/lib/db/mockDb";

const ADMIN_CAMPUS_ID = "43554";
const ADMIN_PASSKEYS = ["43554", "campusadmin", "admin123", process.env.ADMIN_KEY].filter(Boolean);

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
    const campusId = (body.campus_id || body.campusId || "").toString().trim();
    const pin = (body.pin || body.passkey || "").toString().trim();
    const contactVerification = (body.email || body.contact || "").toString().trim().toLowerCase();

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
    // Condition A: Admin ID 43554 or Admin Passkey
    const isAdmin =
      campusId === ADMIN_CAMPUS_ID ||
      ADMIN_PASSKEYS.some((k) => k && k.toString().toLowerCase() === pin.toLowerCase()) ||
      ADMIN_PASSKEYS.some((k) => k && k.toString().toLowerCase() === campusId.toLowerCase());

    // Condition B: Original Reporter (5-digit Campus ID match + PIN match)
    const isReporterIdMatch =
      currentReport.reporter_campus_id &&
      campusId &&
      currentReport.reporter_campus_id.toString().trim() === campusId;

    const isPinMatch =
      (currentReport.reporter_pin && currentReport.reporter_pin.toString().trim() === pin) ||
      (currentReport.secret_pin && currentReport.secret_pin.toString().trim() === pin);

    // Condition C: Contact Info / Email match
    const isContactMatch =
      contactVerification &&
      (currentReport.contact_info.toLowerCase().includes(contactVerification) ||
        currentReport.contact_name.toLowerCase().includes(contactVerification));

    const isAuthorized = isAdmin || (isReporterIdMatch && isPinMatch) || (isContactMatch && isPinMatch) || isPinMatch;

    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          error: `Unauthorized: This report can only be resolved by the original reporter (ID: ${
            currentReport.reporter_campus_id || "Reporter"
          }) with their PIN, or the Campus Administrator (Admin ID: ${ADMIN_CAMPUS_ID}).`,
        },
        { status: 403 }
      );
    }

    // 3. Update status in Database
    const authorizedBy = isAdmin
      ? `Campus Administrator (Admin ID: ${ADMIN_CAMPUS_ID})`
      : `Verified Reporter (Campus ID: ${campusId || currentReport.reporter_campus_id || "Student"})`;

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
