import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { isServerSupabaseConfigured } from "@/lib/supabase/server";
import { isGeminiConfigured } from "@/lib/gemini/client";

export async function GET() {
  const supabaseLive = isServerSupabaseConfigured() || isSupabaseConfigured();
  const geminiLive = isGeminiConfigured();

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      supabase_pgvector: {
        configured: supabaseLive,
        mode: supabaseLive ? "Live Supabase PostgreSQL with pgvector" : "Local Mock In-Memory pgvector Engine",
      },
      gemini_ai: {
        configured: geminiLive,
        mode: geminiLive ? "Live Google Gemini 2.5 Flash & text-embedding-004" : "Local Forensic Heuristic Engine & Vectorizer",
      },
    },
  });
}
