"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Report, MatchResponse } from "@/types/report";
import { AttributeBadge } from "@/components/AttributeBadge";
import { MatchCard } from "@/components/MatchCard";
import { formatDate, getCategoryBadge } from "@/lib/utils";
import { ClaimModal } from "@/components/ClaimModal";
import {
  Sparkles,
  ArrowLeft,
  MapPin,
  Clock,
  User,
  Phone,
  CheckCircle2,
  Tag,
  Share2,
  RefreshCw,
  Lock
} from "lucide-react";

export default function ReportDetailPage() {
  const params = useParams();
  const reportId = params.id as string;

  const [report, setReport] = useState<Report | null>(null);
  const [matchData, setMatchData] = useState<MatchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 space-y-6">
        <div className="h-8 w-48 bg-[#FFE2E2] rounded-xl animate-pulse" />
        <div className="h-96 bg-[#FFE2E2]/60 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4 text-plum-950">
        <h2 className="text-xl font-black text-plum-950">Report Not Found</h2>
        <p className="text-xs text-plum-700 font-medium">The requested report ID could not be located.</p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C5B3D3] text-plum-950 text-xs font-bold border border-[#ab92bf] shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </a>
      </div>
    );
  }

  const isLost = report.type === "lost";
  const isResolved = report.status === "resolved";

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-plum-950">
      {/* Back Link & Quick Actions */}
      <ClaimModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        reportId={report.id}
        reportTitle={report.title}
        reporterCampusId={report.reporter_campus_id}
        onSuccess={() => fetchReportAndMatches()}
      />

      <div className="flex items-center justify-between">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-plum-800 hover:text-plum-950 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore Feed</span>
        </a>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFE2E2] border border-[#F5CBCB] text-xs font-bold text-plum-900 hover:bg-[#F5CBCB] shadow-sm transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? "Link Copied!" : "Share"}</span>
          </button>

          {!isResolved && (
            <button
              onClick={() => setIsClaimModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-md bg-[#6ea17e] hover:bg-[#5e916e] text-white border border-[#9ec0aa]"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Verify & Resolve Case</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Report Header Panel */}
      <div className="rounded-3xl overflow-hidden border border-[#F5CBCB] bg-[#FFE2E2] p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Image */}
          <div className="md:col-span-5">
            <div className="relative h-72 rounded-2xl overflow-hidden bg-[#FAF0F0] border border-[#F5CBCB]">
              {report.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={report.image_url}
                  alt={report.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-plum-400">
                  <Tag className="w-12 h-12 mb-2 opacity-50 text-plum-500" />
                  <span className="text-xs font-semibold text-plum-600">No image provided</span>
                </div>
              )}

              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm ${
                    isLost ? "bg-rose-500 text-white" : "bg-emerald-600 text-white"
                  }`}
                >
                  {isLost ? "Lost Item" : "Found Item"}
                </span>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold border border-[#F5CBCB] bg-[#FBEFEF]/90 text-plum-900 shadow-sm"
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
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Case Resolved
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-plum-950 leading-tight">
                {report.title}
              </h1>

              <p className="text-sm text-plum-800 mt-3 leading-relaxed font-medium">
                {report.description}
              </p>
            </div>

            {/* Metadata Card */}
            <div className="p-4 rounded-xl bg-[#FBEFEF] border border-[#F5CBCB] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs shadow-sm font-medium">
              <div className="flex items-center gap-2.5 text-plum-900">
                <MapPin className="w-4 h-4 text-plum-700 shrink-0" />
                <div>
                  <span className="block text-[10px] text-plum-600 uppercase font-bold">Location</span>
                  <span className="font-bold">{report.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-plum-900">
                <Clock className="w-4 h-4 text-plum-700 shrink-0" />
                <div>
                  <span className="block text-[10px] text-plum-600 uppercase font-bold">Date & Time</span>
                  <span className="font-bold">{formatDate(report.date_time || report.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-plum-900">
                <User className="w-4 h-4 text-plum-700 shrink-0" />
                <div>
                  <span className="block text-[10px] text-plum-600 uppercase font-bold">Contact Name</span>
                  <span className="font-bold">{report.contact_name}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-plum-900">
                <Phone className="w-4 h-4 text-plum-700 shrink-0" />
                <div>
                  <span className="block text-[10px] text-plum-600 uppercase font-bold">Contact Info</span>
                  <span className="font-bold truncate">{report.contact_info}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Forensic Extracted Attributes Breakdown */}
        {report.attributes && (
          <div className="p-5 rounded-2xl bg-[#FBEFEF] border border-[#F5CBCB] space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-plum-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-plum-900" />
                <span>Multimodal AI Forensic Analysis (Gemini)</span>
              </h3>
              <span className="text-[11px] text-emerald-800 font-bold font-mono">768-d vector active</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#FFE2E2] border border-[#F5CBCB]">
                <span className="text-plum-600 block text-[10px] uppercase font-bold">Brand</span>
                <span className="font-black text-plum-950 mt-0.5 block">{report.attributes.brand || "Unspecified"}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FFE2E2] border border-[#F5CBCB]">
                <span className="text-plum-600 block text-[10px] uppercase font-bold">Primary Color</span>
                <span className="font-black text-plum-950 mt-0.5 block">{report.attributes.primary_color || "Standard"}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FFE2E2] border border-[#F5CBCB]">
                <span className="text-plum-600 block text-[10px] uppercase font-bold">Condition</span>
                <span className="font-black text-emerald-800 mt-0.5 block">{report.attributes.condition || "Good"}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FFE2E2] border border-[#F5CBCB]">
                <span className="text-plum-600 block text-[10px] uppercase font-bold">Value Category</span>
                <span className="font-black text-plum-950 mt-0.5 block">{report.attributes.estimated_value_range || "Medium"}</span>
              </div>
            </div>

            {report.attributes.identifying_marks && report.attributes.identifying_marks.length > 0 && (
              <div className="text-xs space-y-1">
                <span className="text-plum-800 font-bold">Distinct Identifying Marks:</span>
                <div className="flex flex-wrap gap-1.5">
                  {report.attributes.identifying_marks.map((mark, i) => (
                    <AttributeBadge key={i} label="Mark" value={mark} variant="mark" />
                  ))}
                </div>
              </div>
            )}

            {report.attributes.enhanced_summary && (
              <p className="text-xs text-plum-800 italic bg-[#FFE2E2]/60 p-3 rounded-xl border border-[#F5CBCB] font-medium">
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
            <h2 className="text-xl font-black text-plum-950 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-plum-900" />
              <span>AI Opposite Matches ({isLost ? "Found Reports" : "Lost Reports"})</span>
            </h2>
            <p className="text-xs text-plum-700 mt-0.5 font-medium">
              Ranked nearest neighbors from pgvector with Gemini multimodal verification score.
            </p>
          </div>

          <a
            href={`/match?reportId=${report.id}`}
            className="text-xs font-bold text-plum-900 hover:text-plum-700 underline"
          >
            Open in AI Match Hub →
          </a>
        </div>

        {matchingLoading ? (
          <div className="h-48 rounded-2xl bg-[#FFE2E2]/60 border border-[#F5CBCB] animate-pulse flex items-center justify-center text-xs text-plum-700 font-bold">
            <RefreshCw className="w-5 h-5 animate-spin mr-2 text-plum-900" />
            Computing cosine similarities and Gemini match evaluations...
          </div>
        ) : !matchData?.matches || matchData.matches.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#FFE2E2]/60 border border-[#F5CBCB] text-plum-800 text-xs space-y-2 shadow-sm">
            <p className="font-bold">No active {isLost ? "found" : "lost"} candidates discovered at this time.</p>
            <p className="text-plum-600 font-medium">
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
