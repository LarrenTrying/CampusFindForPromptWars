import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase, isServerSupabaseConfigured } from "@/lib/supabase/server";
import { MockDb } from "@/lib/db/mockDb";
import { evaluateMatchPairWithGemini } from "@/lib/gemini/matcher";
import { getEmbedding } from "@/lib/gemini/client";
import { Report, ReportType, MatchCandidate, MatchResponse } from "@/types/report";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get("reportId");

    if (!reportId) {
      return NextResponse.json(
        { success: false, error: "Missing reportId query parameter" },
        { status: 400 }
      );
    }

    return await handleMatchProcess(reportId);
  } catch (error: any) {
    console.error("GET /api/match error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process match" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const reportId = body.reportId;

    if (!reportId) {
      return NextResponse.json(
        { success: false, error: "Missing reportId in request body" },
        { status: 400 }
      );
    }

    return await handleMatchProcess(reportId);
  } catch (error: any) {
    console.error("POST /api/match error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process match" },
      { status: 500 }
    );
  }
}

async function handleMatchProcess(reportId: string) {
  // 1. Fetch source report
  let sourceReport: Report | null = null;
  const isSupabase = isServerSupabaseConfigured();

  if (isSupabase) {
    const supabase = getServerSupabase();
    if (supabase) {
      const { data } = await supabase.from("reports").select("*").eq("id", reportId).single();
      if (data) sourceReport = data as Report;
    }
  }

  if (!sourceReport) {
    sourceReport = MockDb.getReportById(reportId);
  }

  if (!sourceReport) {
    return NextResponse.json(
      { success: false, error: `Report with ID '${reportId}' not found.` },
      { status: 404 }
    );
  }

  // Ensure embedding exists
  if (!sourceReport.embedding || sourceReport.embedding.length === 0) {
    const textToEmbed = `${sourceReport.title} ${sourceReport.description} ${sourceReport.category} ${sourceReport.location} ${JSON.stringify(sourceReport.attributes || {})}`;
    sourceReport.embedding = await getEmbedding(textToEmbed);
  }

  const targetType: ReportType = sourceReport.type === "lost" ? "found" : "lost";

  // 2. Vector Nearest Neighbor Search for Opposite Type Reports
  let candidatePairs: { report: Report; similarity: number }[] = [];

  if (isSupabase) {
    const supabase = getServerSupabase();
    if (supabase) {
      const { data, error } = await supabase.rpc("match_opposite_reports", {
        query_embedding: sourceReport.embedding,
        target_type: targetType,
        match_threshold: 0.15,
        match_count: 6,
      });

      if (!error && data && data.length > 0) {
        candidatePairs = data.map((item: any) => ({
          report: item as Report,
          similarity: Number(item.similarity) || 0,
        }));
      }
    }
  }

  // Fallback to MockDb pgvector simulation if Supabase returned nothing or isn't connected
  if (candidatePairs.length === 0) {
    candidatePairs = MockDb.matchOppositeReports(
      sourceReport.embedding,
      targetType,
      0.15,
      6
    );
  }

  if (candidatePairs.length === 0) {
    return NextResponse.json({
      success: true,
      source_report: sourceReport,
      target_type: targetType,
      candidates_evaluated: 0,
      matches: [],
      message: `No active ${targetType} reports found with sufficient vector similarity.`,
    });
  }

  // 3. Ask Gemini to score + explain each candidate match
  const matchCandidates: MatchCandidate[] = await Promise.all(
    candidatePairs.map(async ({ report, similarity }) => {
      // Evaluate with Gemini
      const geminiEvaluation = await evaluateMatchPairWithGemini(
        sourceReport!,
        report
      );

      // Weighted score: 70% Gemini reasoning score + 30% vector similarity score
      const vectorScore = Math.round(similarity * 100);
      const finalScore = Math.round(
        geminiEvaluation.confidence_score * 0.7 + vectorScore * 0.3
      );

      return {
        report,
        vector_similarity: similarity,
        gemini_evaluation: geminiEvaluation,
        final_score: finalScore,
      };
    })
  );

  // Sort by final score descending
  matchCandidates.sort((a, b) => b.final_score - a.final_score);

  const response: MatchResponse = {
    source_report: sourceReport,
    target_type: targetType,
    candidates_evaluated: matchCandidates.length,
    matches: matchCandidates,
  };

  return NextResponse.json({
    success: true,
    ...response,
  });
}
