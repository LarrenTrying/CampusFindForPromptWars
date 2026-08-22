"use client";

import React, { useState } from "react";
import { MatchCandidate, Report } from "@/types/report";
import { formatDate, timeAgo, getCategoryBadge, getScoreColor } from "@/lib/utils";
import { AttributeBadge } from "./AttributeBadge";
import { ClaimModal } from "./ClaimModal";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  User,
  Phone,
  ChevronDown,
  ChevronUp,
  Lock
} from "lucide-react";

interface MatchCardProps {
  candidate: MatchCandidate;
  sourceReport: Report;
  onResolved?: (reportId: string) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  candidate,
  sourceReport,
  onResolved,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClaimed, setIsClaimed] = useState(candidate.report.status === "resolved");

  const evalData = candidate.gemini_evaluation;
  const score = candidate.final_score ?? Math.round((candidate.vector_similarity ?? 0) * 100);
  const scoreStyle = getScoreColor(score);
  const isCandidateFound = candidate.report.type === "found";

  const handleClaimSuccess = () => {
    setIsClaimed(true);
    if (onResolved) {
      onResolved(candidate.report.id);
    }
  };

  return (
    <>
      <ClaimModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        reportId={candidate.report.id}
        reportTitle={candidate.report.title}
        sourceReportId={sourceReport.id}
        reporterCampusId={candidate.report.reporter_campus_id}
        onSuccess={handleClaimSuccess}
      />

      <div className={`rounded-2xl overflow-hidden border transition-all duration-300 shadow-sm ${
        score >= 80 
          ? "border-emerald-400 bg-[#FFE2E2] shadow-md shadow-emerald-900/10" 
          : score >= 50 
          ? "border-[#F5CBCB] bg-[#FFE2E2]" 
          : "border-[#F5CBCB] bg-[#FFE2E2]/75"
      }`}>
        {/* Header Bar */}
        <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border-b border-[#F5CBCB] bg-[#FBEFEF]">
          <div className="flex items-center gap-3">
            {/* Match Score Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFE2E2] border border-[#F5CBCB] shadow-sm">
              <div className={`w-3 h-3 rounded-full ${scoreStyle.bg} animate-pulse`} />
              <span className="text-sm font-black text-plum-950">{score}% Match</span>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${scoreStyle.text}`}>
                {evalData?.confidence_level || scoreStyle.label}
              </span>
            </div>

            <span className="text-xs text-plum-700 font-semibold">
              Vector Similarity: {Math.round((candidate.vector_similarity ?? 0) * 100)}%
            </span>
          </div>

          {/* Action / Claim Button with Security Lock */}
          <div className="flex items-center gap-2">
            {isClaimed ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Item Claimed & Reunited!
              </span>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#6ea17e] hover:bg-[#5e916e] text-white shadow-md border border-[#9ec0aa] transition active:scale-95"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Confirm & Claim Match</span>
              </button>
            )}

            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg bg-[#FFE2E2] text-plum-700 hover:text-plum-950 border border-[#F5CBCB]"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="p-5 space-y-5 text-plum-950">
          {/* Candidate Item Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Candidate Image & Basic Info */}
            <div className="md:col-span-4 flex flex-col gap-3">
              <div className="relative h-44 rounded-xl overflow-hidden bg-[#FAF0F0] border border-[#F5CBCB]">
                {candidate.report.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={candidate.report.image_url}
                    alt={candidate.report.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-plum-400 text-xs font-medium">
                    No image available
                  </div>
                )}
                <span
                  className={`absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                    isCandidateFound
                      ? "bg-emerald-600 text-white"
                      : "bg-rose-500 text-white"
                  }`}
                >
                  {isCandidateFound ? "Found Report" : "Lost Report"}
                </span>
              </div>

              {/* Contact Info Box */}
              <div className="p-3 rounded-xl bg-[#FBEFEF] border border-[#F5CBCB] text-xs space-y-1.5 shadow-sm font-medium">
                <div className="flex items-center gap-2 text-plum-950 font-bold">
                  <User className="w-3.5 h-3.5 text-plum-700 shrink-0" />
                  <span>{candidate.report.contact_name}</span>
                </div>
                <div className="flex items-center gap-2 text-plum-700">
                  <Phone className="w-3.5 h-3.5 text-plum-500 shrink-0" />
                  <span className="truncate">{candidate.report.contact_info}</span>
                </div>
                <div className="flex items-center gap-2 text-plum-700">
                  <MapPin className="w-3.5 h-3.5 text-plum-500 shrink-0" />
                  <span className="truncate">{candidate.report.location}</span>
                </div>
                <div className="flex items-center gap-2 text-plum-700">
                  <Clock className="w-3.5 h-3.5 text-plum-500 shrink-0" />
                  <span>{timeAgo(candidate.report.date_time || candidate.report.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Gemini AI Deep Reasoning & Analysis */}
            <div className="md:col-span-8 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <a
                    href={`/reports/${candidate.report.id}`}
                    className="text-lg font-black text-plum-950 hover:text-plum-700 transition"
                  >
                    {candidate.report.title}
                  </a>
                </div>
                <p className="text-xs text-plum-800 mt-1 line-clamp-2 font-medium">
                  {candidate.report.description}
                </p>

                {/* Gemini Match Analysis Box */}
                <div className="mt-3 p-3.5 rounded-xl bg-[#FBEFEF] border border-[#F5CBCB] space-y-2 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-bold text-plum-900">
                    <Sparkles className="w-4 h-4 text-plum-900" />
                    <span>Gemini Multimodal Reasoning</span>
                  </div>
                  <p className="text-xs text-plum-800 leading-relaxed font-medium">
                    {evalData?.match_summary || "Gemini evaluated physical attributes and spatial/temporal plausibility."}
                  </p>
                </div>
              </div>

              {/* Extracted Attributes Comparison */}
              {candidate.report.attributes && (
                <div className="flex flex-wrap gap-1.5">
                  {candidate.report.attributes.brand && (
                    <AttributeBadge label="Brand" value={candidate.report.attributes.brand} variant="brand" />
                  )}
                  {candidate.report.attributes.primary_color && (
                    <AttributeBadge label="Color" value={candidate.report.attributes.primary_color} variant="color" />
                  )}
                  {candidate.report.attributes.identifying_marks && (
                    <AttributeBadge label="Marks" value={candidate.report.attributes.identifying_marks} variant="mark" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Expanded Deep Breakdown */}
          {expanded && evalData && (
            <div className="pt-4 border-t border-[#F5CBCB] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Matching Features */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 space-y-2 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Matching Attributes & Clues</span>
                </div>
                <ul className="space-y-1.5 text-emerald-950 font-medium">
                  {evalData.matching_features?.map((feature, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-700 font-bold">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Conflicting Features / Verification Checklist */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 space-y-2 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>Discrepancies & Verification Checklist</span>
                </div>
                <ul className="space-y-1.5 text-amber-950 font-medium">
                  {evalData.conflicting_features?.map((conflict, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-700 font-bold">•</span>
                      <span>{conflict}</span>
                    </li>
                  ))}
                  {evalData.spatial_temporal_analysis && (
                    <li className="flex items-start gap-1.5 pt-1 text-amber-900 italic font-semibold">
                      <span>📍 {evalData.spatial_temporal_analysis}</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
