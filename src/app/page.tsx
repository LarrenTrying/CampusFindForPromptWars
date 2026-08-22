"use client";

import React, { useEffect, useState } from "react";
import { Report, ReportType, ItemCategory } from "@/types/report";
import { ReportCard } from "@/components/ReportCard";
import { 
  Sparkles, 
  Search, 
  PlusCircle, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Database,
  ArrowRight,
  TrendingUp,
  Layers
} from "lucide-react";

const CATEGORIES: (ItemCategory | "All")[] = [
  "All",
  "Electronics",
  "Wallets & Cards",
  "Keys",
  "Bags & Backpacks",
  "Pets & Animals",
  "Jewelry & Watches",
  "Clothing & Accessories",
  "Documents & IDs",
  "Other",
];

export default function HomePage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<ReportType | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (categoryFilter !== "All") params.set("category", categoryFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (searchQuery) params.set("query", searchQuery);

      const res = await fetch(`/api/reports?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setReports(data.reports);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [typeFilter, categoryFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReports();
  };

  const handleSeed = async () => {
    setLoading(true);
    try {
      await fetch("/api/seed", { method: "POST" });
      await fetchReports();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  // Compute stats
  const totalLost = reports.filter((r) => r.type === "lost").length;
  const totalFound = reports.filter((r) => r.type === "found").length;
  const totalResolved = reports.filter((r) => r.status === "resolved").length;

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 p-8 sm:p-12 shadow-2xl">
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Challenge: Smart Campus Lost & Found</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Smart Campus AI that{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
              reunites lost items
            </span>{" "}
            even with vague descriptions
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Campus lost-and-found is often fragmented by incomplete details and differing wording. Our system uses Google Gemini multimodal vision + Supabase pgvector to automatically extract forensic attributes, score potential matches with confidence percentages, explain match reasons, and enable semantic natural-language campus search.
          </p>

          {/* Quick CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="/submit?type=lost"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Lost Item</span>
            </a>
            <a
              href="/submit?type=found"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Found Item</span>
            </a>
            <a
              href="/search"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span>Semantic Search</span>
            </a>
          </div>
        </div>

        {/* Live System Stats Bar */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="text-xs text-slate-400">Active Lost Reports</div>
            <div className="text-2xl font-bold text-rose-400 mt-1">{totalLost}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="text-xs text-slate-400">Active Found Reports</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{totalFound}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="text-xs text-slate-400">Cases Reunited / Resolved</div>
            <div className="text-2xl font-bold text-indigo-400 mt-1">{totalResolved}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
            <div className="text-xs text-slate-400">Vector Embeddings</div>
            <div className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>768-d pgvector Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Type Toggle Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                typeFilter === "all"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All Items ({reports.length})
            </button>
            <button
              onClick={() => setTypeFilter("lost")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                typeFilter === "lost"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Lost Only
            </button>
            <button
              onClick={() => setTypeFilter("found")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                typeFilter === "found"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Found Only
            </button>
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by keyword, color, brand, or location..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          </form>

          {/* Refresh / Seed Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSeed}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-800 transition"
              title="Reset Sample Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Reset Demo Seed</span>
            </button>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                categoryFilter === cat
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                  : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-80 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="py-16 text-center rounded-3xl border border-slate-800/80 bg-slate-900/30 p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto text-slate-500">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200">No reports found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Try adjusting your filters or click the button below to seed realistic demo lost & found cases.
          </p>
          <button
            onClick={handleSeed}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Load Sample Lost & Found Data</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}
