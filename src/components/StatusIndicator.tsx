"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Database, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

interface StatusData {
  services?: {
    supabase_pgvector?: { configured: boolean; mode: string };
    gemini_ai?: { configured: boolean; mode: string };
  };
}

export const StatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [open, setOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/status");
      const data = await res.json();
      setStatus(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      await fetch("/api/seed", { method: "POST" });
      window.location.reload();
    } catch (e) {
      console.error(e);
      setSeeding(false);
    }
  };

  const isGeminiLive = status?.services?.gemini_ai?.configured;
  const isSupabaseLive = status?.services?.supabase_pgvector?.configured;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-300 transition"
      >
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span>AI & Vector Engine</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-900 border border-slate-800 p-4 shadow-2xl z-50 text-xs">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <span className="font-semibold text-slate-200">System Integration Status</span>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            {/* Supabase Status */}
            <div className="flex items-start gap-2.5">
              <Database className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-1.5 font-medium text-slate-200">
                  <span>Supabase pgvector</span>
                  {isSupabaseLive ? (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                      Live Cloud
                    </span>
                  ) : (
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded border border-blue-500/30">
                      Local Vector Engine
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {status?.services?.supabase_pgvector?.mode || "pgvector 768-d cosine similarity index active"}
                </p>
              </div>
            </div>

            {/* Gemini Status */}
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-1.5 font-medium text-slate-200">
                  <span>Google Gemini AI</span>
                  {isGeminiLive ? (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                      Live API
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                      Mock AI Mode
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {status?.services?.gemini_ai?.mode || "Multimodal extraction & match reasoning pipeline ready"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={handleSeedDemo}
              disabled={seeding}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium py-1 px-2 rounded hover:bg-blue-500/10 transition"
            >
              <RefreshCw className={seeding ? "w-3.5 h-3.5 animate-spin" : "w-3.5 h-3.5"} />
              {seeding ? "Seeding..." : "Reset Demo Sample Data"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
