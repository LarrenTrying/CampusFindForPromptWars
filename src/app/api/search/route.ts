import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase, isServerSupabaseConfigured } from "@/lib/supabase/server";
import { MockDb } from "@/lib/db/mockDb";
import { getEmbedding } from "@/lib/gemini/client";
import { Report, ReportType, SemanticSearchResult } from "@/types/report";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = body.query || "";
    const type = body.type as ReportType | "all" | undefined;
    const category = body.category || "All";

    if (!query.trim()) {
      return NextResponse.json(
        { success: false, error: "Search query cannot be empty" },
        { status: 400 }
      );
    }

    // 1. Generate embedding vector for the search query
    const queryEmbedding = await getEmbedding(query);

    let searchResults: SemanticSearchResult[] = [];

    // 2. Query Supabase pgvector if configured
    if (isServerSupabaseConfigured()) {
      const supabase = getServerSupabase();
      if (supabase) {
        const { data, error } = await supabase.rpc("search_reports", {
          query_embedding: queryEmbedding,
          filter_type: type === "all" ? null : type,
          filter_category: category === "All" ? null : category,
          match_threshold: 0.15,
          match_count: 15,
        });

        if (!error && data && data.length > 0) {
          searchResults = data.map((item: any) => ({
            report: item as Report,
            similarity: Number(item.similarity) || 0,
            highlighted_match_reason: generateSearchMatchSnippet(query, item),
          }));
        }
      }
    }

    // Fallback to MockDb vector search
    if (searchResults.length === 0) {
      const mockMatches = MockDb.searchReports(
        queryEmbedding,
        type || "all",
        category || "All",
        0.12,
        15
      );

      searchResults = mockMatches.map(({ report, similarity }) => ({
        report,
        similarity,
        highlighted_match_reason: generateSearchMatchSnippet(query, report),
      }));
    }

    return NextResponse.json({
      success: true,
      query,
      resultsCount: searchResults.length,
      results: searchResults,
    });
  } catch (error: any) {
    console.error("POST /api/search error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute semantic search" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const type = (searchParams.get("type") as ReportType | "all") || "all";
  const category = searchParams.get("category") || "All";

  if (!query) {
    return NextResponse.json({ success: true, results: [] });
  }

  // Delegate to POST handler logic
  const queryEmbedding = await getEmbedding(query);
  const mockMatches = MockDb.searchReports(queryEmbedding, type, category, 0.1, 15);
  const results = mockMatches.map(({ report, similarity }) => ({
    report,
    similarity,
    highlighted_match_reason: generateSearchMatchSnippet(query, report),
  }));

  return NextResponse.json({
    success: true,
    query,
    resultsCount: results.length,
    results,
  });
}

function generateSearchMatchSnippet(query: string, report: Report): string {
  const qTokens = query.toLowerCase().split(/\W+/).filter((t) => t.length > 2);
  const matches: string[] = [];
  const attrs = report.attributes;

  if (attrs?.brand && qTokens.some((t) => attrs.brand?.toLowerCase().includes(t))) {
    matches.push(`Brand: ${attrs.brand}`);
  }
  if (attrs?.primary_color && qTokens.some((t) => attrs.primary_color?.toLowerCase().includes(t))) {
    matches.push(`Color: ${attrs.primary_color}`);
  }
  if (attrs?.identifying_marks?.length) {
    const markMatch = attrs.identifying_marks.find((m) =>
      qTokens.some((t) => m.toLowerCase().includes(t))
    );
    if (markMatch) matches.push(`Mark: ${markMatch}`);
  }
  if (qTokens.some((t) => report.location.toLowerCase().includes(t))) {
    matches.push(`Location: ${report.location}`);
  }

  if (matches.length > 0) {
    return `Matches on ${matches.join(" • ")}`;
  }
  return `Semantically aligned with ${report.category} report (${report.type.toUpperCase()})`;
}
