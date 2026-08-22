"use client";

import React, { useState, useEffect } from "react";
import { UserStats } from "@/lib/auth/userStore";
import {
  Users,
  Search,
  ShieldCheck,
  Hash,
  FileText,
  CheckCircle2,
  HelpCircle,
  Package,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw
} from "lucide-react";

export default function UsersDirectoryPage() {
  const [users, setUsers] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "student" | "admin">("all");
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (e) {
      console.error("Failed to fetch users:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.campus_id.includes(searchTerm);

    const matchesRole =
      roleFilter === "all" ||
      (roleFilter === "admin" && u.is_admin) ||
      (roleFilter === "student" && !u.is_admin);

    return matchesSearch && matchesRole;
  });

  const totalReportsCount = users.reduce((acc, u) => acc + u.total_reports, 0);
  const totalResolvedCount = users.reduce((acc, u) => acc + u.resolved_reports_count, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
            <Users className="w-4 h-4" />
            <span>Campus Registry & Activity Ledger</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            User Directory & Report Ledger
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Complete directory of registered 5-digit campus student IDs, administrator roles, and real-time report statistics.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="self-start md:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Campus Users</span>
          <div className="text-2xl font-extrabold text-white">{users.length}</div>
          <span className="text-[11px] text-slate-500">Registered with 5-digit IDs</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-indigo-400 font-semibold uppercase">Total Reports Filed</span>
          <div className="text-2xl font-extrabold text-indigo-300">{totalReportsCount}</div>
          <span className="text-[11px] text-slate-500">Lost & Found cases</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-emerald-400 font-semibold uppercase">Reunited & Resolved</span>
          <div className="text-2xl font-extrabold text-emerald-300">{totalResolvedCount}</div>
          <span className="text-[11px] text-slate-500">Successfully closed</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-amber-400 font-semibold uppercase">Admin Authority</span>
          <div className="text-2xl font-extrabold text-amber-300">1</div>
          <span className="text-[11px] text-slate-500">Master Resolver</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or 5-digit ID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {(["all", "student", "admin"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                roleFilter === r
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {r === "all" ? "All Users" : r === "admin" ? "Administrators" : "Students"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-4 px-5">User / Name</th>
                <th className="py-4 px-5">Campus ID</th>
                <th className="py-4 px-5">Role</th>
                <th className="py-4 px-5 text-center">Total Reports</th>
                <th className="py-4 px-5 text-center">Active Lost</th>
                <th className="py-4 px-5 text-center">Active Found</th>
                <th className="py-4 px-5 text-center">Resolved</th>
                <th className="py-4 px-5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                    <span>Loading campus user records...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No users found matching &ldquo;{searchTerm}&rdquo;
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isExpanded = expandedUserId === u.campus_id;
                  return (
                    <React.Fragment key={u.campus_id}>
                      <tr className="hover:bg-slate-800/40 transition">
                        {/* Name & Avatar */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                              u.is_admin
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                : "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-mono"
                            }`}>
                              {u.is_admin ? "ADM" : u.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-100 block">{u.name}</span>
                              <span className="text-[11px] text-slate-500">Registered campus member</span>
                            </div>
                          </div>
                        </td>

                        {/* Campus ID */}
                        <td className="py-4 px-5">
                          <span className="font-mono font-bold text-indigo-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                            #{u.campus_id}
                          </span>
                        </td>

                        {/* Role */}
                        <td className="py-4 px-5">
                          {u.is_admin ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30 text-[11px]">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Administrator
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-semibold border border-slate-700 text-[11px]">
                              Student
                            </span>
                          )}
                        </td>

                        {/* Total Reports */}
                        <td className="py-4 px-5 text-center font-bold text-slate-200">
                          {u.total_reports}
                        </td>

                        {/* Active Lost */}
                        <td className="py-4 px-5 text-center">
                          {u.lost_reports_count > 0 ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 font-semibold border border-rose-500/30 text-[11px]">
                              {u.lost_reports_count} lost
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        {/* Active Found */}
                        <td className="py-4 px-5 text-center">
                          {u.found_reports_count > 0 ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30 text-[11px]">
                              {u.found_reports_count} found
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        {/* Resolved */}
                        <td className="py-4 px-5 text-center">
                          {u.resolved_reports_count > 0 ? (
                            <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 font-semibold border border-purple-500/30 text-[11px] flex items-center justify-center gap-1 mx-auto w-max">
                              <CheckCircle2 className="w-3 h-3 text-purple-400" />
                              {u.resolved_reports_count} resolved
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        {/* Expand Action */}
                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => setExpandedUserId(isExpanded ? null : u.campus_id)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Sub-Row with Report List */}
                      {isExpanded && (
                        <tr className="bg-slate-950/70 border-b border-slate-800">
                          <td colSpan={8} className="p-5">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-300 text-xs flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-indigo-400" />
                                  <span>Reports filed by {u.name} (ID #{u.campus_id})</span>
                                </span>
                                <a
                                  href={`/?search=${u.campus_id}`}
                                  className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                                >
                                  <span>Filter in Main Feed</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>

                              {u.recent_reports.length === 0 ? (
                                <p className="text-xs text-slate-500 italic">No reports filed yet.</p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                  {u.recent_reports.map((r) => (
                                    <a
                                      key={r.id}
                                      href={`/reports/${r.id}`}
                                      className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition space-y-1 block"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                          r.type === "lost" ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"
                                        }`}>
                                          {r.type}
                                        </span>
                                        {r.status === "resolved" && (
                                          <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-1.5 py-0.5 rounded">
                                            Resolved
                                          </span>
                                        )}
                                      </div>
                                      <h4 className="font-semibold text-slate-200 line-clamp-1">{r.title}</h4>
                                      <span className="text-[10px] text-slate-500 block truncate">📍 {r.location}</span>
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
