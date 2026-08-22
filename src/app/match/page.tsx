"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Report, MatchResponse, MatchCandidate } from "@/types/report";
import { MatchCard } from "@/components/MatchCard";
import { AttributeBadge } from "@/components/AttributeBadge";
import { formatDate, timeAgo, getCategoryBadge } from "@/lib/utils";
import {
  Sparkles,
  Search,
  ArrowRight,
  RefreshCw,
  Layers,
  MapPin,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

function MatchHubContent() {
  const searchParams = useSearchParams();
  const initialReportId = searchParams.get("reportId") || "";

  const [allReports, setAllReports] = useState<Report[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string>(initialReportId);
  const [matchData, setMatchData] = useState<MatchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingReports, setLoadingReports] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch all reports for the selector
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await fetch("/api/reports");
        const data = await res.json();
        if (data.success && data.reports) {
          setAllReports(data.reports);
          // If no initial report ID selected, default to the first active lost or found item
          if (!initialReportId && data.reports.length > 0) {
            setSelectedReportId(data.reports[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingReports(false);
      }
    };
    fetchAll();
  }, [initialReportId]);

  // Run matching whenever selectedReportId changes
  const runMatch = async (reportId: string) => {
    if (!reportId) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/match?reportId=${reportId}`);
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to find matches");
      }
      setMatchData(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to run vector nearest-neighbor matching");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedReportId) {
      runMatch(selectedReportId);
    }
  }, [selectedReportId]);

  const sourceReport = matchData?.source_report || allReports.find((r) => r.id === selectedReportId);
  const isLost = sourceReport?.type === "lost";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Automated pgvector & Gemini Evaluation Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          AI Opposite-Type Match Center
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Select any report to discover opposite-type candidates (<span className="text-rose-400 font-semibold">Lost</span> ↔ <span className="text-emerald-400 font-semibold">Found</span>) using cosine vector distance and multimodal Gemini reasoning.
        </p>
      </div>

      {/* Report Selector Bar */}
      <div className="glass-panel rounded-2xl p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex-1 space-y-1">
          <label className="block text-xs font-semibold text-slate-300">
            Select Report to Find Matches For:
          </label>
          <select
            value={selectedReportId}
            onChange={(e) => setSelectedReportId(e.target.value)}
            disabled={loadingReports || loading}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            {allReports.map((r) => (
              <option key={r.id} value={r.id}>
                [{r.type.toUpperCase()}] {r.title} ({r.location}) - {r.category}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => runMatch(selectedReportId)}
          disabled={loading || !selectedReportId}
          className="self-end sm:self-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center gap-2"
        >
          <RefreshCw className={loading ? "w-4 h-4 animate-spin" : "w-4 h-4"} />
          <span>{loading ? "Evaluating Candidates..." : "Re-run AI Matching"}</span>
        </button>
      </div>

      {/* Main Matching Grid */}
      {sourceReport && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Source Item Card (Left Column) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-card rounded-2xl p-5 border border-indigo-500/30 bg-slate-900/90 space-y-4 sticky top-24">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Source Report</span>
                </span>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase ${
                    isLost ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
                  }`}
                >
                  {isLost ? "Lost Item" : "Found Item"}
                </span>
              </div>

              {/* Image */}
              {sourceReport.image_url && (
                <div className="h-44 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sourceReport.image_url}
                    alt={sourceReport.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Title & Details */}
              <div>
                <h3 className="text-lg font-bold text-slate-100">{sourceReport.title}</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {sourceReport.description}
                </p>
              </div>

              {/* Extracted Attributes */}
              {sourceReport.attributes && (
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    AI-Extracted Attributes:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {sourceReport.attributes.brand && (
                      <AttributeBadge label="Brand" value={sourceReport.attributes.brand} variant="brand" />
                    )}
                    {sourceReport.attributes.primary_color && (
                      <AttributeBadge label="Color" value={sourceReport.attributes.primary_color} variant="color" />
                    )}
                    {sourceReport.attributes.condition && (
                      <AttributeBadge label="Condition" value={sourceReport.attributes.condition} variant="condition" />
                    )}
                    {sourceReport.attributes.identifying_marks?.map((m, i) => (
                      <AttributeBadge key={i} label="Mark" value={m} variant="mark" />
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 space-y-1.5">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{sourceReport.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{formatDate(sourceReport.date_time || sourceReport.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{sourceReport.contact_name} ({sourceReport.contact_info})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Matches Column (Right Column) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>
                  Ranked Opposite-Type Matches ({matchData?.matches?.length || 0})
                </span>
              </h2>
              <span className="text-xs text-slate-400">
                Searching opposite: <span className="font-semibold text-white">{isLost ? "Found Reports" : "Lost Reports"}</span>
              </span>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((n) => (
                  <div
                    key={n}
                    className="h-64 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse flex flex-col justify-center items-center text-slate-500 text-xs gap-2"
                  >
                    <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                    <span>Gemini analyzing visual cues & spatial-temporal plausibility...</span>
                  </div>
                ))}
              </div>
            ) : errorMsg ? (
              <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            ) : !matchData?.matches || matchData.matches.length === 0 ? (
              <div className="text-center py-16 rounded-2xl bg-slate-900/30 border border-slate-800 p-8 space-y-3">
                <Layers className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-semibold text-slate-300">
                  No matching {isLost ? "found" : "lost"} reports discovered yet
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Our vector engine found no opposite reports exceeding the similarity threshold. As new reports are submitted, matches will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {matchData.matches.map((candidate) => (
                  <MatchCard
                    key={candidate.report.id}
                    candidate={candidate}
                    sourceReport={sourceReport}
                    onResolved={() => runMatch(selectedReportId)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MatchHubPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading AI match hub...</div>}>
      <MatchHubContent />
    </Suspense>
  );
}
