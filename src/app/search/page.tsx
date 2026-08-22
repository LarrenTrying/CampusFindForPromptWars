"use client";

import React, { useState } from "react";
import { Report, ReportType, SemanticSearchResult, ItemCategory } from "@/types/report";
import { ReportCard } from "@/components/ReportCard";
import { AttributeBadge } from "@/components/AttributeBadge";
import { formatDate, timeAgo, getCategoryBadge, getScoreColor } from "@/lib/utils";
import {
  Search,
  Sparkles,
  Filter,
  MapPin,
  Clock,
  ArrowRight,
  RefreshCw,
  Compass,
  CheckCircle2
} from "lucide-react";

const SAMPLE_QUERIES = [
  "Space gray Apple MacBook with tech stickers left in library",
  "Rose Gold TI-84 Plus CE graphing calculator in Science Hall",
  "Brown leather Fossil wallet with student ID at Student Union",
  "AirPods Pro in olive green case with brass carabiner at gym",
  "Dorm room keys and Toyota fob with blue Stitch keychain",
];

const CATEGORIES: (ItemCategory | "All")[] = [
  "All",
  "Electronics & Laptops",
  "Student IDs & Wallets",
  "Dorm & Car Keys",
  "Backpacks & Bags",
  "Calculators & Books",
  "Watches & Jewelry",
  "Jackets & Apparel",
  "Other",
];

export default function SemanticSearchPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<ReportType | "all">("all");
  const [category, setCategory] = useState<string>("All");
  const [results, setResults] = useState<SemanticSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const q = customQuery !== undefined ? customQuery : query;
    if (!q.trim()) return;

    setLoading(true);
    setHasSearched(true);
    if (customQuery !== undefined) setQuery(customQuery);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          type,
          category,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>768-Dimension pgvector Semantic Search</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Semantic & Natural Language Search
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Search using full sentences, physical descriptions, locations, or distinguishing features. Our vector embedding model finds semantically relevant items even with different wording.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={(e) => handleSearch(e)} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. 'I lost my gray laptop with developer stickers at the library yesterday afternoon'..."
            className="w-full pl-12 pr-32 py-4 rounded-2xl bg-slate-900 border-2 border-slate-800 text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-xl"
          />
          <Search className="w-6 h-6 text-slate-500 absolute left-4 top-4" />

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2.5 top-2.5 bottom-2.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md transition disabled:opacity-40 flex items-center gap-1.5"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Search</span>
              </>
            )}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          {/* Type Selector */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              type="button"
              onClick={() => setType("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                type === "all" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All Types
            </button>
            <button
              type="button"
              onClick={() => setType("lost")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                type === "lost" ? "bg-rose-500/20 text-rose-300" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Lost Only
            </button>
            <button
              type="button"
              onClick={() => setType("found")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                type === "found" ? "bg-emerald-500/20 text-emerald-300" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Found Only
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Category:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Example Query Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs text-slate-500">Try searching:</span>
          {SAMPLE_QUERIES.map((sq, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSearch(undefined, sq)}
              className="text-xs px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 border border-slate-800 transition"
            >
              &ldquo;{sq}&rdquo;
            </button>
          ))}
        </div>
      </form>

      {/* Search Results */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-36 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : hasSearched && results.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-slate-900/30 border border-slate-800 p-8 space-y-3">
          <Search className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-300">No matching reports found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try phrasing your description differently or broaden your search criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map(({ report, similarity, highlighted_match_reason }) => {
            const scorePct = Math.round(similarity * 100);
            const scoreColor = getScoreColor(scorePct);
            const isLost = report.type === "lost";

            return (
              <div
                key={report.id}
                className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/70 hover:border-slate-700 transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Left Title & Status */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isLost ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {report.type}
                    </span>

                    <a
                      href={`/reports/${report.id}`}
                      className="text-base font-bold text-slate-100 hover:text-indigo-300 transition"
                    >
                      {report.title}
                    </a>
                  </div>

                  {/* Similarity Badge */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className={`w-2.5 h-2.5 rounded-full ${scoreColor.bg}`} />
                    <span className="text-xs font-bold text-white">{scorePct}% Match</span>
                    <span className={`text-[10px] font-semibold uppercase ${scoreColor.text}`}>
                      {scoreColor.label}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  {/* Image */}
                  {report.image_url && (
                    <div className="sm:col-span-3 h-28 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={report.image_url}
                        alt={report.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Content Details */}
                  <div className={report.image_url ? "sm:col-span-9 space-y-2" : "sm:col-span-12 space-y-2"}>
                    <p className="text-xs text-slate-300 line-clamp-2">{report.description}</p>

                    {highlighted_match_reason && (
                      <div className="text-xs text-indigo-300 bg-indigo-950/40 border border-indigo-500/20 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{highlighted_match_reason}</span>
                      </div>
                    )}

                    {report.attributes && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {report.attributes.brand && (
                          <AttributeBadge label="Brand" value={report.attributes.brand} variant="brand" />
                        )}
                        {report.attributes.primary_color && (
                          <AttributeBadge label="Color" value={report.attributes.primary_color} variant="color" />
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
                </div>

                {/* Footer bar */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {report.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {timeAgo(report.date_time || report.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`/match?reportId=${report.id}`}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-medium flex items-center gap-1 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Find AI Matches</span>
                    </a>
                    <a
                      href={`/reports/${report.id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition"
                    >
                      View Report
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
