"use client";

import React, { useState, useEffect } from "react";
import { UserStats } from "@/lib/auth/userStore";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  Search,
  ShieldCheck,
  Hash,
  FileText,
  CheckCircle2,
  Lock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle
} from "lucide-react";

export default function UsersDirectoryPage() {
  const { user, isAdmin, login } = useAuth();
  const [users, setUsers] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "student" | "admin">("all");
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  // Admin gate state
  const [adminIdInput, setAdminIdInput] = useState("");
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState("");

  const fetchUsers = async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
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
    if (isAdmin) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError("");
    setAdminLoginLoading(true);
    try {
      const res = await login(adminIdInput, adminPasswordInput);
      if (!res.success) {
        setAdminLoginError(res.error || "Administrator authentication failed.");
      }
    } finally {
      setAdminLoginLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-6 animate-fadeIn">
        <div className="glass-panel p-8 rounded-3xl border border-amber-500/30 bg-slate-900/90 shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Lock className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Administrator Access Required</h2>
              <p className="text-xs text-slate-400">
                The User Directory is restricted to authorized campus administrators.
              </p>
            </div>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Admin Campus ID
              </label>
              <input
                type="text"
                maxLength={5}
                value={adminIdInput}
                onChange={(e) => setAdminIdInput(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 5-digit Admin ID"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Admin Password
              </label>
              <input
                type="password"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                placeholder="Enter admin password"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            {adminLoginError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{adminLoginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={adminLoginLoading}
              className="w-full py-3 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/25 transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{adminLoginLoading ? "Verifying Authority..." : "Unlock Administrator Directory"}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Administrator Control Console</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            Campus User Directory & Report Ledger
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Complete registry of 5-digit campus student IDs, administrator privileges, and active report statistics.
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
          <span className="text-[11px] text-slate-500">Registered student IDs</span>
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
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {(["all", "student", "admin"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                roleFilter === r
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
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
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
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
