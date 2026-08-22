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

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-[#F5CBCB] bg-gradient-to-b from-[#FFE2E2]/90 via-[#FBEFEF] to-[#FBEFEF] p-8 sm:p-12 shadow-xl">
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-[#C5B3D3]/35 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 rounded-full bg-[#F5CBCB]/40 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#C5B3D3]/40 text-plum-950 border border-[#C5B3D3]">
            <Sparkles className="w-3.5 h-3.5 text-plum-900" />
            <span>Challenge: Smart Campus Lost & Found</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-plum-950 leading-tight">
            Smart Campus AI that{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-plum-950 via-[#744B7F] to-[#9174AA]">
              reunites lost items
            </span>{" "}
            even with vague descriptions
          </h1>

          <p className="text-base sm:text-lg text-plum-800 leading-relaxed font-medium">
            Campus lost-and-found is often fragmented by incomplete details and differing wording. Our system uses Google Gemini multimodal vision + Supabase pgvector to automatically extract forensic attributes, score potential matches with confidence percentages, explain match reasons, and verify secure claims.
          </p>

          {/* Quick CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="/submit?type=lost"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-[#d97c7c] hover:bg-[#c96c6c] text-white shadow-md shadow-rose-900/10 border border-[#e5adad] transition transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Lost Item</span>
            </a>
            <a
              href="/submit?type=found"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-[#6ea17e] hover:bg-[#5e916e] text-white shadow-md shadow-emerald-900/10 border border-[#9ec0aa] transition transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Found Item</span>
            </a>
            <a
              href="/search"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-[#C5B3D3] hover:bg-[#b8a3c8] text-plum-950 border border-[#ab92bf] shadow-sm transition"
            >
              <Search className="w-4 h-4 text-plum-800" />
              <span>Semantic Search</span>
            </a>
          </div>
        </div>

        {/* Live System Stats Bar */}
        <div className="mt-10 pt-6 border-t border-[#F5CBCB] grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab("lost")}
            className={`p-4 rounded-2xl border text-left transition ${
              activeTab === "lost"
                ? "bg-[#FFE2E2] border-rose-400 shadow-md"
                : "bg-[#FBEFEF]/80 hover:bg-[#FFE2E2] border-[#F5CBCB]"
            }`}
          >
            <div className="text-xs text-rose-800 font-bold uppercase tracking-wider">Active Lost Reports</div>
            <div className="text-3xl font-black text-rose-700 mt-1 flex items-baseline gap-2">
              <span>{stats.lost}</span>
              <span className="text-xs font-semibold text-plum-700">items reported</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("found")}
            className={`p-4 rounded-2xl border text-left transition ${
              activeTab === "found"
                ? "bg-[#FFE2E2] border-emerald-400 shadow-md"
                : "bg-[#FBEFEF]/80 hover:bg-[#FFE2E2] border-[#F5CBCB]"
            }`}
          >
            <div className="text-xs text-emerald-800 font-bold uppercase tracking-wider">Active Found Reports</div>
            <div className="text-3xl font-black text-emerald-700 mt-1 flex items-baseline gap-2">
              <span>{stats.found}</span>
              <span className="text-xs font-semibold text-plum-700">items turned in</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("resolved")}
            className={`p-4 rounded-2xl border text-left transition ${
              activeTab === "resolved"
                ? "bg-[#C5B3D3]/60 border-[#ab92bf] shadow-md"
                : "bg-[#FBEFEF]/80 hover:bg-[#FFE2E2] border-[#F5CBCB]"
            }`}
          >
            <div className="text-xs text-plum-800 font-bold uppercase tracking-wider">Reunited Cases Archive</div>
            <div className="text-3xl font-black text-plum-950 mt-1 flex items-baseline gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 self-center" />
              <span>{stats.resolved}</span>
              <span className="text-xs font-semibold text-plum-700">cases solved</span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Tabs (Separating Active Lists from Resolved/Reunited) */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Distinct Tab Bar */}
          <div className="flex items-center p-1.5 rounded-2xl bg-[#FFE2E2] border border-[#F5CBCB] shrink-0 gap-1 overflow-x-auto shadow-sm">
            <button
              onClick={() => setActiveTab("active_all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "active_all"
                  ? "bg-[#C5B3D3] text-plum-950 border border-[#ab92bf] shadow-sm"
                  : "text-plum-800 hover:text-plum-950 hover:bg-[#F5CBCB]/50"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Active Items</span>
            </button>

            <button
              onClick={() => setActiveTab("lost")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "lost"
                  ? "bg-rose-200 text-rose-900 border border-rose-400 shadow-sm"
                  : "text-plum-800 hover:text-rose-800 hover:bg-[#F5CBCB]/50"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Lost Items</span>
            </button>

            <button
              onClick={() => setActiveTab("found")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "found"
                  ? "bg-emerald-200 text-emerald-900 border border-emerald-400 shadow-sm"
                  : "text-plum-800 hover:text-emerald-800 hover:bg-[#F5CBCB]/50"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Found Items</span>
            </button>

            {/* Completely Separate Reunited / Resolved Tab */}
            <button
              onClick={() => setActiveTab("resolved")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "resolved"
                  ? "bg-[#C5B3D3] text-plum-950 border border-[#ab92bf] shadow-sm"
                  : "text-plum-800 bg-[#F5CBCB]/60 hover:bg-[#F5CBCB] border border-[#F5CBCB]"
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-emerald-700" />
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
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FBEFEF] border border-[#F5CBCB] text-xs text-plum-950 placeholder-plum-500 focus:outline-none focus:border-[#C5B3D3] shadow-sm font-medium"
            />
            <Search className="w-4 h-4 text-plum-600 absolute left-3.5 top-3" />
          </form>

          {/* Refresh Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { fetchReports(); fetchStats(); }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFE2E2] hover:bg-[#F5CBCB] text-xs font-bold text-plum-900 border border-[#F5CBCB] shadow-sm transition"
              title="Refresh Feed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Feed</span>
            </button>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                categoryFilter === cat
                  ? "bg-[#C5B3D3] text-plum-950 border border-[#ab92bf] shadow-sm"
                  : "bg-[#FFE2E2] text-plum-800 hover:bg-[#F5CBCB] border border-[#F5CBCB]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Header for Resolved Tab */}
      {activeTab === "resolved" && (
        <div className="p-4 rounded-2xl bg-[#FFE2E2] border border-[#F5CBCB] flex items-center gap-3 text-xs text-plum-800 shadow-sm">
          <Award className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold text-plum-950 block text-sm">Reunited Cases Archive</span>
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
              className="h-80 rounded-2xl bg-[#FFE2E2]/60 border border-[#F5CBCB] animate-pulse"
            />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="py-16 text-center rounded-3xl border border-[#F5CBCB] bg-[#FFE2E2]/60 p-8 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#F5CBCB]/60 flex items-center justify-center mx-auto text-plum-800">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-plum-950">
            {activeTab === "resolved" ? "No resolved cases in archive yet" : "No active reports found"}
          </h3>
          <p className="text-sm text-plum-800 max-w-md mx-auto">
            {activeTab === "resolved"
              ? "When a match is confirmed and claimed, it will appear here in the Reunited archive."
              : "Try adjusting your filters or search keywords."}
          </p>
          <button
            onClick={() => {
              setActiveTab("active_all");
              setCategoryFilter("All");
              setSearchQuery("");
              fetchReports();
              fetchStats();
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C5B3D3] hover:bg-[#b8a3c8] text-xs font-bold text-plum-950 border border-[#ab92bf] shadow-sm transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Filters & Refresh</span>
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
