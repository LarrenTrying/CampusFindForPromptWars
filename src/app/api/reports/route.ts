import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase, isServerSupabaseConfigured } from "@/lib/supabase/server";
import { MockDb } from "@/lib/db/mockDb";
import { extractAttributesFromInput } from "@/lib/gemini/extractor";
import { getEmbedding } from "@/lib/gemini/client";
import { CreateReportInput, ReportType } from "@/types/report";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as ReportType | "all" | null;
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const query = searchParams.get("query");

    if (isServerSupabaseConfigured()) {
      const supabase = getServerSupabase();
      if (supabase) {
        let dbQuery = supabase.from("reports").select("*").order("created_at", { ascending: false });

        if (type && type !== "all") {
          dbQuery = dbQuery.eq("type", type);
        }
        if (category && category !== "All") {
          dbQuery = dbQuery.eq("category", category);
        }
        if (status && status !== "all") {
          dbQuery = dbQuery.eq("status", status);
        }
        if (query) {
          dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`);
        }

        const { data, error } = await dbQuery;
        if (!error && data) {
          return NextResponse.json(
            { success: true, reports: data, source: "supabase" },
            { headers: { "Cache-Control": "no-store, max-age=0" } }
          );
        }
      }
    }

    // Mock DB Fallback & In-Memory Sync
    const reports = MockDb.getAllReports({
      type: type || undefined,
      category: category || undefined,
      status: status || undefined,
      query: query || undefined,
    });

    return NextResponse.json(
      {
        success: true,
        reports,
        source: "mock_db",
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error: any) {
    console.error("GET /api/reports error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateReportInput;

    if (!body.title || !body.description || !body.type || !body.location) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: title, description, type, location" },
        { status: 400 }
      );
    }

    // 1. Call Gemini multimodal attribute extractor
    const extractedAttributes = await extractAttributesFromInput({
      title: body.title,
      description: body.description,
      category: body.category,
      location: body.location,
      imageBase64: body.image_base64 || body.image_url,
    });

    // 2. Formulate comprehensive text representation for vector embedding
    const embeddingText = `
Title: ${body.title}
Type: ${body.type}
Category: ${body.category || extractedAttributes.category}
Location: ${body.location}
Description: ${body.description}
Brand: ${extractedAttributes.brand || ""}
Colors: ${extractedAttributes.primary_color || ""} ${extractedAttributes.secondary_colors?.join(" ") || ""}
Materials: ${extractedAttributes.materials?.join(" ") || ""}
Marks: ${extractedAttributes.identifying_marks?.join(" ") || ""}
Tags: ${extractedAttributes.keyword_tags?.join(" ") || ""}
Summary: ${extractedAttributes.enhanced_summary || ""}
`.trim();

    // 3. Generate 768-d embedding
    const embedding = await getEmbedding(embeddingText);

    // 4. Save to MockDb first so it is immediately visible
    const campusId = body.reporter_campus_id || "90421";
    const newReport = MockDb.createReport(
      {
        ...body,
        reporter_campus_id: campusId,
      },
      extractedAttributes,
      embedding
    );

    // 5. Also save to Supabase pgvector if connected
    if (isServerSupabaseConfigured()) {
      const supabase = getServerSupabase();
      if (supabase) {
        const insertPayload = {
          id: newReport.id,
          type: body.type,
          title: body.title,
          description: body.description,
          category: body.category || extractedAttributes.category || "Other",
          image_url: body.image_url || body.image_base64 || null,
          location: body.location,
          date_time: body.date_time || new Date().toISOString(),
          contact_name: body.contact_name,
          contact_info: body.contact_info,
          reporter_campus_id: campusId,
          status: "active",
          attributes: {
            ...extractedAttributes,
            ...body.custom_attributes,
          },
          embedding: embedding,
        };

        const { data, error } = await supabase
          .from("reports")
          .insert(insertPayload)
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({
            success: true,
            report: data,
            reporter_campus_id: campusId,
            source: "supabase",
          });
        }
        console.warn("Supabase insert error, saved to local store:", error);
      }
    }

    return NextResponse.json({
      success: true,
      report: newReport,
      reporter_campus_id: campusId,
      source: "mock_db",
    });
  } catch (error: any) {
    console.error("POST /api/reports error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create report" },
      { status: 500 }
    );
  }
}
