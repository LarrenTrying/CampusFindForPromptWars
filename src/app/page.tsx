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
  Layers,
  Award,
  HeartHandshake
} from "lucide-react";

const CATEGORIES: (ItemCategory | "All")[] = [
  "All",
  "Electronics & Laptops",
  "Student IDs & Wallets",
  "Bottles, Mugs & Drinkware",
  "Dorm & Car Keys",
  "Backpacks & Bags",
  "Calculators & Books",
  "Watches & Jewelry",
  "Jackets & Apparel",
  "Other",
];

type MainTab = "active_all" | "lost" | "found" | "resolved";

export default function HomePage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MainTab>("active_all");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    lost: 0,
    found: 0,
    resolved: 0,
  });

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/reports?status=all", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache, no-store" },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.reports)) {
        const all: Report[] = data.reports;
        const lost = all.filter((r) => r.type === "lost" && r.status !== "resolved").length;
        const found = all.filter((r) => r.type === "found" && r.status !== "resolved").length;
        const resolved = all.filter((r) => r.status === "resolved").length;
        setStats({ lost, found, resolved });
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (activeTab === "lost") {
        params.set("type", "lost");
        params.set("status", "active");
      } else if (activeTab === "found") {
        params.set("type", "found");
        params.set("status", "active");
      } else if (activeTab === "resolved") {
        params.set("status", "resolved");
      } else {
        // active_all
        params.set("status", "active");
      }

      if (categoryFilter !== "All") params.set("category", categoryFilter);
      if (searchQuery) params.set("query", searchQuery);

      const res = await fetch(`/api/reports?${params.toString()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache, no-store" },
      });
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
    fetchStats();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [activeTab, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReports();
  };

  const handleSeed = async () => {
    setLoading(true);
    try {
      await fetch("/api/seed", { method: "POST" });
      await fetchReports();
      await fetchStats();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

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
            Campus lost-and-found is often fragmented by incomplete details and differing wording. Our system uses Google Gemini multimodal vision + Supabase pgvector to automatically extract forensic attributes, score potential matches with confidence percentages, explain match reasons, and verify secure claims.
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
        <div className="mt-10 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab("lost")}
            className={`p-4 rounded-2xl border text-left transition ${
              activeTab === "lost"
                ? "bg-rose-950/40 border-rose-500/50 shadow-lg shadow-rose-950/20"
                : "bg-slate-900/50 hover:bg-slate-900/80 border-slate-800"
            }`}
          >
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Lost Reports</div>
            <div className="text-3xl font-extrabold text-rose-400 mt-1 flex items-baseline gap-2">
              <span>{stats.lost}</span>
              <span className="text-xs font-medium text-slate-400 font-normal">items reported</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("found")}
            className={`p-4 rounded-2xl border text-left transition ${
              activeTab === "found"
                ? "bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-950/20"
                : "bg-slate-900/50 hover:bg-slate-900/80 border-slate-800"
            }`}
          >
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Found Reports</div>
            <div className="text-3xl font-extrabold text-emerald-400 mt-1 flex items-baseline gap-2">
              <span>{stats.found}</span>
              <span className="text-xs font-medium text-slate-400 font-normal">items turned in</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("resolved")}
            className={`p-4 rounded-2xl border text-left transition ${
              activeTab === "resolved"
                ? "bg-indigo-950/40 border-indigo-500/50 shadow-lg shadow-indigo-950/20"
                : "bg-slate-900/50 hover:bg-slate-900/80 border-slate-800"
            }`}
          >
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Reunited Cases Archive</div>
            <div className="text-3xl font-extrabold text-indigo-300 mt-1 flex items-baseline gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 self-center" />
              <span>{stats.resolved}</span>
              <span className="text-xs font-medium text-slate-400 font-normal">cases solved</span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Tabs (Separating Active Lists from Resolved/Reunited) */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Distinct Tab Bar */}
          <div className="flex items-center p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shrink-0 gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab("active_all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "active_all"
                  ? "bg-slate-800 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Active Items</span>
            </button>

            <button
              onClick={() => setActiveTab("lost")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "lost"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>Lost Items</span>
            </button>

            <button
              onClick={() => setActiveTab("found")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "found"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Found Items</span>
            </button>

            {/* Completely Separate Reunited / Resolved Tab */}
            <button
              onClick={() => setActiveTab("resolved")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "resolved"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-indigo-400 bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/30"
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-emerald-300" />
              <span>🎉 Reunited & Resolved</span>
            </button>
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by keyword, color, brand, or location..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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

      {/* Header for Resolved Tab */}
      {activeTab === "resolved" && (
        <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex items-center gap-3 text-xs text-indigo-300">
          <Award className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <span className="font-bold text-white block">Reunited Cases Archive</span>
            These items have been verified by the owner or campus administrator and successfully returned. They are archived here and removed from active search.
          </div>
        </div>
      )}

      {/* Reports Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
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
          <h3 className="text-lg font-semibold text-slate-200">
            {activeTab === "resolved" ? "No resolved cases in archive yet" : "No active reports found"}
          </h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {activeTab === "resolved"
              ? "When a match is confirmed and claimed, it will appear here in the Reunited archive."
              : "Try adjusting your filters or click the button below to reload demo campus reports."}
          </p>
          <button
            onClick={handleSeed}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Load Sample Campus Data</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}
