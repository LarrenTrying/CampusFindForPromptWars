"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Report, MatchResponse } from "@/types/report";
import { MatchCard } from "@/components/MatchCard";
import { AttributeBadge } from "@/components/AttributeBadge";
import { formatDate } from "@/lib/utils";
import {
  Sparkles,
  RefreshCw,
  Layers,
  MapPin,
  Clock,
  User,
  ShieldCheck,
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
    <div className="max-w-6xl mx-auto space-y-8 text-plum-950">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-plum-800 uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4 text-plum-900" />
          <span>Automated pgvector & Gemini Evaluation Engine</span>
        </div>
        <h1 className="text-3xl font-black text-plum-950">
          AI Opposite-Type Match Center
        </h1>
        <p className="text-sm text-plum-800 mt-1 font-medium">
          Select any report to discover opposite-type candidates (<span className="text-rose-700 font-bold">Lost</span> ↔ <span className="text-emerald-700 font-bold">Found</span>) using cosine vector distance and multimodal Gemini reasoning.
        </p>
      </div>

      {/* Report Selector Bar */}
      <div className="rounded-2xl p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#FFE2E2] border border-[#F5CBCB] shadow-sm">
        <div className="flex-1 space-y-1">
          <label className="block text-xs font-bold text-plum-900">
            Select Report to Find Matches For:
          </label>
          <select
            value={selectedReportId}
            onChange={(e) => setSelectedReportId(e.target.value)}
            disabled={loadingReports || loading}
            className="w-full px-4 py-2.5 rounded-xl bg-[#FBEFEF] border border-[#F5CBCB] text-sm text-plum-950 focus:outline-none focus:border-[#C5B3D3] shadow-sm font-semibold"
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
          className="self-end sm:self-center px-5 py-2.5 rounded-xl bg-[#C5B3D3] hover:bg-[#b8a3c8] text-plum-950 text-xs font-bold shadow-md border border-[#ab92bf] transition flex items-center gap-2"
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
            <div className="rounded-2xl p-5 border border-[#F5CBCB] bg-[#FFE2E2] space-y-4 sticky top-24 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-plum-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-plum-900" />
                  <span>Source Report</span>
                </span>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase shadow-sm ${
                    isLost ? "bg-rose-500 text-white" : "bg-emerald-600 text-white"
                  }`}
                >
                  {isLost ? "Lost Item" : "Found Item"}
                </span>
              </div>

              {/* Image */}
              {sourceReport.image_url && (
                <div className="h-44 rounded-xl overflow-hidden bg-[#FAF0F0] border border-[#F5CBCB]">
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
                <h3 className="text-lg font-black text-plum-950">{sourceReport.title}</h3>
                <p className="text-xs text-plum-800 mt-1.5 leading-relaxed font-medium">
                  {sourceReport.description}
                </p>
              </div>

              {/* Extracted Attributes */}
              {sourceReport.attributes && (
                <div className="pt-2 border-t border-[#F5CBCB] space-y-2">
                  <span className="text-[11px] font-bold text-plum-800 block">
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
              <div className="pt-2 border-t border-[#F5CBCB] text-xs text-plum-700 font-medium space-y-1.5">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-plum-600 shrink-0" />
                  <span className="truncate">{sourceReport.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-plum-600 shrink-0" />
                  <span>{formatDate(sourceReport.date_time || sourceReport.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-plum-600 shrink-0" />
                  <span>{sourceReport.contact_name} ({sourceReport.contact_info})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Matches Column (Right Column) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-plum-950 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-plum-900" />
                <span>
                  Ranked Opposite-Type Matches ({matchData?.matches?.length || 0})
                </span>
              </h2>
              <span className="text-xs text-plum-700 font-semibold">
                Searching opposite: <span className="font-bold text-plum-950">{isLost ? "Found Reports" : "Lost Reports"}</span>
              </span>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((n) => (
                  <div
                    key={n}
                    className="h-64 rounded-2xl bg-[#FFE2E2]/60 border border-[#F5CBCB] animate-pulse flex flex-col justify-center items-center text-plum-700 text-xs gap-2"
                  >
                    <RefreshCw className="w-6 h-6 animate-spin text-plum-900" />
                    <span className="font-bold">Gemini analyzing visual cues & spatial-temporal plausibility...</span>
                  </div>
                ))}
              </div>
            ) : errorMsg ? (
              <div className="p-6 rounded-2xl bg-rose-100 border border-rose-300 text-rose-900 text-xs flex items-center gap-3 font-bold shadow-sm">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            ) : !matchData?.matches || matchData.matches.length === 0 ? (
              <div className="text-center py-16 rounded-2xl bg-[#FFE2E2]/60 border border-[#F5CBCB] p-8 space-y-3 shadow-sm">
                <Layers className="w-12 h-12 text-plum-400 mx-auto" />
                <h3 className="text-base font-bold text-plum-950">
                  No matching {isLost ? "found" : "lost"} reports discovered yet
                </h3>
                <p className="text-xs text-plum-700 max-w-sm mx-auto font-medium">
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
    <Suspense fallback={<div className="p-12 text-center text-plum-600">Loading AI match hub...</div>}>
      <MatchHubContent />
    </Suspense>
  );
}
