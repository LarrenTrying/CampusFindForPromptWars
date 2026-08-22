"use client";

import React from "react";
import { Report } from "@/types/report";
import { formatDate, timeAgo, getCategoryBadge } from "@/lib/utils";
import { AttributeBadge } from "./AttributeBadge";
import { 
  MapPin, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Tag,
  Eye
} from "lucide-react";

interface ReportCardProps {
  report: Report;
  onMatchClick?: (report: Report) => void;
  onStatusChange?: (reportId: string, newStatus: "active" | "resolved") => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
}) => {
  const isLost = report.type === "lost";
  const isResolved = report.status === "resolved";
  const categoryStyle = getCategoryBadge(report.category);

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col group border border-[#F5CBCB] bg-[#FFE2E2]/75 hover:border-[#C5B3D3] transition-all duration-300 shadow-sm">
      {/* Top Banner / Image Area */}
      <div className="relative h-48 w-full bg-[#FAF0F0] overflow-hidden">
        {report.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={report.image_url}
            alt={report.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FFE2E2] to-[#F5CBCB]/40 text-plum-400">
            <Tag className="w-12 h-12 stroke-[1.5] mb-2 opacity-60 text-plum-500" />
            <span className="text-xs font-semibold text-plum-600">No photo provided</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#FFE2E2]/90 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {/* Lost/Found Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm ${
              isLost
                ? "bg-rose-500 text-white border border-rose-400"
                : "bg-emerald-600 text-white border border-emerald-500"
            }`}
          >
            {isLost ? "Lost Item" : "Found Item"}
          </span>

          {/* Category Badge */}
          <span
            className="px-2.5 py-0.5 rounded-full text-xs font-bold border border-[#F5CBCB] bg-[#FBEFEF]/90 text-plum-900 shadow-sm backdrop-blur-md"
          >
            {report.category}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {isResolved ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Resolved
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#C5B3D3]/90 text-plum-950 border border-[#ab92bf] shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Active
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Title */}
          <a
            href={`/reports/${report.id}`}
            className="block text-base font-black text-plum-950 hover:text-plum-700 transition line-clamp-1"
          >
            {report.title}
          </a>

          {/* Description */}
          <p className="text-sm text-plum-800 mt-1.5 line-clamp-2 leading-relaxed font-medium">
            {report.description}
          </p>

          {/* AI Extracted Attributes Pills */}
          {report.attributes && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {report.attributes.brand && (
                <AttributeBadge label="Brand" value={report.attributes.brand} variant="brand" />
              )}
              {report.attributes.primary_color && (
                <AttributeBadge label="Color" value={report.attributes.primary_color} variant="color" />
              )}
              {report.attributes.materials && report.attributes.materials.length > 0 && (
                <AttributeBadge label="Material" value={report.attributes.materials[0]} />
              )}
              {report.attributes.identifying_marks && report.attributes.identifying_marks.length > 0 && (
                <AttributeBadge
                  label="Mark"
                  value={report.attributes.identifying_marks[0]}
                  variant="mark"
                />
              )}
            </div>
          )}
        </div>

        {/* Metadata: Location, Time & Reporter ID */}
        <div className="pt-3 border-t border-[#F5CBCB] space-y-1.5 text-xs text-plum-700 font-medium">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-3.5 h-3.5 text-plum-600 shrink-0" />
              <span className="truncate">{report.location}</span>
            </div>
            {report.reporter_campus_id && (
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded shrink-0 ${
                report.reporter_campus_id === "43554"
                  ? "bg-[#C5B3D3] text-plum-950 border border-[#ab92bf]"
                  : "bg-[#FBEFEF] text-plum-900 border border-[#F5CBCB]"
              }`}>
                {report.reporter_campus_id === "43554" ? "Admin" : `ID #${report.reporter_campus_id}`}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-plum-600 shrink-0" />
            <span>{timeAgo(report.date_time || report.created_at)}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center gap-2">
          <a
            href={`/match?reportId=${report.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#C5B3D3] hover:bg-[#b8a3c8] text-plum-950 border border-[#ab92bf] shadow-sm transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-plum-900" />
            <span>Check AI Matches</span>
          </a>

          <a
            href={`/reports/${report.id}`}
            className="p-2 rounded-xl bg-[#FBEFEF] hover:bg-[#F5CBCB] text-plum-900 border border-[#F5CBCB] shadow-sm transition"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
