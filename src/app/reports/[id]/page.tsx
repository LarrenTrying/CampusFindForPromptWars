"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Report, MatchResponse } from "@/types/report";
import { AttributeBadge } from "@/components/AttributeBadge";
import { MatchCard } from "@/components/MatchCard";
import { formatDate, timeAgo, getCategoryBadge } from "@/lib/utils";
import confetti from "canvas-confetti";
import {
  Sparkles,
  ArrowLeft,
  MapPin,
  Clock,
  User,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Tag,
  Share2,
  Check,
  RefreshCw,
  Eye
} from "lucide-react";

export default function ReportDetailPage() {
  const params = useParams();
  const reportId = params.id as string;

  const [report, setReport] = useState<Report | null>(null);
  const [matchData, setMatchData] = useState<MatchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchReportAndMatches = async () => {
    setLoading(true);
    try {
      // 1. Fetch Report
      const repRes = await fetch(`/api/reports/${reportId}`);
      const repData = await repRes.json();
      if (repData.success && repData.report) {
        setReport(repData.report);

        // 2. Fetch AI Matches
        setMatchingLoading(true);
        const matchRes = await fetch(`/api/match?reportId=${reportId}`);
        const matchJson = await matchRes.json();
        if (matchJson.success) {
          setMatchData(matchJson);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setMatchingLoading(false);
    }
  };

  useEffect(() => {
    if (reportId) {
      fetchReportAndMatches();
    }
  }, [reportId]);

  const handleResolve = async () => {
    if (!report) return;
    setResolving(true);
    try {
      const newStatus = report.status === "resolved" ? "active" : "resolved";
      const res = await fetch(`/api/reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setReport(data.report);
        if (newStatus === "resolved") {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setResolving(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 space-y-6">
        <div className="h-8 w-48 bg-slate-800 rounded-xl animate-pulse" />
        <div className="h-96 bg-slate-900 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-200">Report Not Found</h2>
        <p className="text-xs text-slate-400">The requested report ID could not be located.</p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </a>
      </div>
    );
  }

  const isLost = report.type === "lost";
  const isResolved = report.status === "resolved";
  const categoryStyle = getCategoryBadge(report.category);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back Link & Quick Actions */}
      <div className="flex items-center justify-between">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore Feed</span>
        </a>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? "Link Copied!" : "Share"}</span>
          </button>

          <button
            onClick={handleResolve}
            disabled={resolving}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-md ${
              isResolved
                ? "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isResolved ? "Reopen Report" : "Mark as Resolved"}</span>
          </button>
        </div>
      </div>

      {/* Main Report Header Panel */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Image */}
          <div className="md:col-span-5">
            <div className="relative h-72 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
              {report.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={report.image_url}
                  alt={report.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                  <Tag className="w-12 h-12 mb-2 opacity-50" />
                  <span className="text-xs">No image provided</span>
                </div>
              )}

              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    isLost ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
                  }`}
                >
                  {isLost ? "Lost Item" : "Found Item"}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}
                >
                  {report.category}
                </span>
              </div>
            </div>
          </div>

          {/* Details & Attributes */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {isResolved && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Case Resolved
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {report.title}
              </h1>

              <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                {report.description}
              </p>
            </div>

            {/* Metadata Card */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-slate-300">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase">Location</span>
                  <span className="font-medium">{report.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase">Date & Time</span>
                  <span className="font-medium">{formatDate(report.date_time || report.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <User className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase">Contact Name</span>
                  <span className="font-medium">{report.contact_name}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase">Contact Info</span>
                  <span className="font-medium truncate">{report.contact_info}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Forensic Extracted Attributes Breakdown */}
        {report.attributes && (
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Multimodal AI Forensic Analysis (Gemini)</span>
              </h3>
              <span className="text-[11px] text-emerald-400 font-mono">768-d vector active</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Brand</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">{report.attributes.brand || "Unspecified"}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Primary Color</span>
                <span className="font-semibold text-cyan-300 mt-0.5 block">{report.attributes.primary_color || "Standard"}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Condition</span>
                <span className="font-semibold text-emerald-300 mt-0.5 block">{report.attributes.condition || "Good"}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Value Category</span>
                <span className="font-semibold text-indigo-300 mt-0.5 block">{report.attributes.estimated_value_range || "Medium"}</span>
              </div>
            </div>

            {report.attributes.identifying_marks && report.attributes.identifying_marks.length > 0 && (
              <div className="text-xs space-y-1">
                <span className="text-slate-400 font-semibold">Distinct Identifying Marks:</span>
                <div className="flex flex-wrap gap-1.5">
                  {report.attributes.identifying_marks.map((mark, i) => (
                    <AttributeBadge key={i} label="Mark" value={mark} variant="mark" />
                  ))}
                </div>
              </div>
            )}

            {report.attributes.enhanced_summary && (
              <p className="text-xs text-slate-400 italic bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                &ldquo;{report.attributes.enhanced_summary}&rdquo;
              </p>
            )}
          </div>
        )}
      </div>

      {/* AI Opposite Matches Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>AI Opposite Matches ({isLost ? "Found Reports" : "Lost Reports"})</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked nearest neighbors from pgvector with Gemini multimodal verification score.
            </p>
          </div>

          <a
            href={`/match?reportId=${report.id}`}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline"
          >
            Open in AI Match Hub →
          </a>
        </div>

        {matchingLoading ? (
          <div className="h-48 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse flex items-center justify-center text-xs text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin mr-2 text-indigo-400" />
            Computing cosine similarities and Gemini match evaluations...
          </div>
        ) : !matchData?.matches || matchData.matches.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/30 border border-slate-800 text-slate-400 text-xs space-y-2">
            <p>No active {isLost ? "found" : "lost"} candidates discovered at this time.</p>
            <p className="text-slate-500">
              When a matching {isLost ? "found" : "lost"} item is submitted, our vector engine will alert and display it here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {matchData.matches.map((candidate) => (
              <MatchCard
                key={candidate.report.id}
                candidate={candidate}
                sourceReport={report}
                onResolved={() => fetchReportAndMatches()}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
