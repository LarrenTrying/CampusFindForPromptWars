import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase, isServerSupabaseConfigured } from "@/lib/supabase/server";
import { MockDb } from "@/lib/db/mockDb";

const ADMIN_PASSKEYS = ["campusadmin", "admin123", "promptwars2026", process.env.ADMIN_KEY].filter(Boolean);

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
    const passkey = (body.passkey || body.pin || "").toString().trim().toLowerCase();
    const contactVerification = (body.email || body.contact || "").toString().trim().toLowerCase();

    if (!["active", "matched", "resolved"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status value" },
        { status: 400 }
      );
    }

    // 1. Fetch current report to verify ownership
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

    // 2. Security / Authorization Check
    // If setting to 'resolved' or changing status, check authorization
    const isAdmin = ADMIN_PASSKEYS.some((k) => k && k.toLowerCase() === passkey);
    const isPinMatch = currentReport.secret_pin && currentReport.secret_pin.toString().trim() === passkey;
    const isContactMatch =
      contactVerification &&
      (currentReport.contact_info.toLowerCase().includes(contactVerification) ||
        currentReport.contact_name.toLowerCase().includes(contactVerification));

    if (!isAdmin && !isPinMatch && !isContactMatch) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: You must provide the Reporter Secret PIN, Reporter Contact Email, or Campus Admin Passkey to resolve this case.",
        },
        { status: 403 }
      );
    }

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
            authorized_by: isAdmin ? "Campus Admin" : "Verified Reporter",
          });
        }
      }
    }

    const updated = MockDb.updateReportStatus(id, status);
    return NextResponse.json({
      success: true,
      report: updated,
      authorized_by: isAdmin ? "Campus Admin" : "Verified Reporter",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Error updating report" },
      { status: 500 }
    );
  }
}
