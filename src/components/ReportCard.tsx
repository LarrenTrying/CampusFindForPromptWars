"use client";

import React from "react";
import { Report } from "@/types/report";
import { formatDate, timeAgo, getCategoryBadge } from "@/lib/utils";
import { AttributeBadge } from "./AttributeBadge";
import { 
  MapPin, 
  Clock, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle,
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
  onMatchClick,
  onStatusChange,
}) => {
  const isLost = report.type === "lost";
  const isResolved = report.status === "resolved";
  const categoryStyle = getCategoryBadge(report.category);

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col group border border-slate-800/80 bg-slate-900/60 hover:border-slate-700/80 transition-all duration-300">
      {/* Top Banner / Image Area */}
      <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
        {report.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={report.image_url}
            alt={report.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 text-slate-600">
            <Tag className="w-12 h-12 stroke-[1.5] mb-2 opacity-50" />
            <span className="text-xs font-medium">No photo provided</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {/* Lost/Found Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-lg ${
              isLost
                ? "bg-rose-500/90 text-rose-50 border border-rose-400/30"
                : "bg-emerald-500/90 text-emerald-50 border border-emerald-400/30"
            }`}
          >
            {isLost ? "Lost Item" : "Found Item"}
          </span>

          {/* Category Badge */}
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium border backdrop-blur-md ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}
          >
            {report.category}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {isResolved ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Resolved
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-950/80 text-blue-300 border border-blue-500/40 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
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
            className="block text-base font-bold text-slate-100 hover:text-indigo-300 transition line-clamp-1"
          >
            {report.title}
          </a>

          {/* Description */}
          <p className="text-sm text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
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

        {/* Metadata: Location, Time & Reporter Account */}
        <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{report.location}</span>
            </div>
            {(report.reporter_email || report.reporter_campus_id) && (
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded shrink-0 max-w-[130px] truncate ${
                (report.reporter_email && report.reporter_email.includes("admin")) || report.reporter_campus_id === "43554"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
                  : "bg-slate-800 text-indigo-300 border border-slate-700"
              }`}>
                {(report.reporter_email && report.reporter_email.includes("admin")) || report.reporter_campus_id === "43554"
                  ? "Admin"
                  : (report.reporter_email || `ID #${report.reporter_campus_id}`)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{timeAgo(report.date_time || report.created_at)}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center gap-2">
          <a
            href={`/match?reportId=${report.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-md shadow-indigo-600/20 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Find {isLost ? "Found" : "Lost"} Matches</span>
          </a>

          <a
            href={`/reports/${report.id}`}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
