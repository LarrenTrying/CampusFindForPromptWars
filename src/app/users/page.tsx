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
      <div className="max-w-md mx-auto py-12 space-y-6 animate-fadeIn text-plum-950">
        <div className="p-8 rounded-3xl border border-[#F5CBCB] bg-[#FFE2E2] shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#C5B3D3]/50 border border-[#ab92bf] flex items-center justify-center shadow-md">
              <Lock className="w-6 h-6 text-plum-900" />
            </div>
            <div>
              <h2 className="text-lg font-black text-plum-950">Administrator Access Required</h2>
              <p className="text-xs text-plum-700 font-medium">
                The User Directory is restricted to authorized campus administrators.
              </p>
            </div>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-plum-900">
                Admin Campus ID
              </label>
              <input
                type="text"
                maxLength={5}
                value={adminIdInput}
                onChange={(e) => setAdminIdInput(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 5-digit Admin ID"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#FBEFEF] border border-[#F5CBCB] text-sm font-mono text-plum-950 placeholder-plum-400 focus:outline-none focus:border-[#C5B3D3] shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-plum-900">
                Admin Password
              </label>
              <input
                type="password"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                placeholder="Enter admin password"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#FBEFEF] border border-[#F5CBCB] text-sm text-plum-950 placeholder-plum-400 focus:outline-none focus:border-[#C5B3D3] shadow-sm"
              />
            </div>

            {adminLoginError && (
              <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 text-xs flex items-center gap-2 font-bold shadow-sm">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{adminLoginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={adminLoginLoading}
              className="w-full py-3 rounded-xl text-xs font-bold bg-[#C5B3D3] hover:bg-[#b8a3c8] text-plum-950 shadow-md border border-[#ab92bf] transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
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
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn text-plum-950">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-plum-800 uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-plum-900" />
            <span>Administrator Control Console</span>
          </div>
          <h1 className="text-3xl font-black text-plum-950">
            Campus User Directory & Report Ledger
          </h1>
          <p className="text-sm text-plum-800 mt-1 font-medium">
            Complete registry of 5-digit campus student IDs, administrator privileges, and active report statistics.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="self-start md:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FFE2E2] hover:bg-[#F5CBCB] border border-[#F5CBCB] text-xs font-bold text-plum-900 shadow-sm transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-[#F5CBCB] bg-[#FFE2E2] shadow-sm space-y-1">
          <span className="text-xs text-plum-700 font-bold uppercase">Total Campus Users</span>
          <div className="text-2xl font-black text-plum-950">{users.length}</div>
          <span className="text-[11px] text-plum-600 font-semibold">Registered student IDs</span>
        </div>

        <div className="p-5 rounded-2xl border border-[#F5CBCB] bg-[#FFE2E2] shadow-sm space-y-1">
          <span className="text-xs text-plum-700 font-bold uppercase">Total Reports Filed</span>
          <div className="text-2xl font-black text-plum-950">{totalReportsCount}</div>
          <span className="text-[11px] text-plum-600 font-semibold">Lost & Found cases</span>
        </div>

        <div className="p-5 rounded-2xl border border-[#F5CBCB] bg-[#FFE2E2] shadow-sm space-y-1">
          <span className="text-xs text-emerald-800 font-bold uppercase">Reunited & Resolved</span>
          <div className="text-2xl font-black text-emerald-700">{totalResolvedCount}</div>
          <span className="text-[11px] text-emerald-800 font-semibold">Successfully closed</span>
        </div>

        <div className="p-5 rounded-2xl border border-[#F5CBCB] bg-[#FFE2E2] shadow-sm space-y-1">
          <span className="text-xs text-plum-700 font-bold uppercase">Admin Authority</span>
          <div className="text-2xl font-black text-plum-950">1</div>
          <span className="text-[11px] text-plum-600 font-semibold">Master Resolver</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#FFE2E2] border border-[#F5CBCB] shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-plum-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or 5-digit ID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FBEFEF] border border-[#F5CBCB] text-xs text-plum-950 placeholder-plum-400 focus:outline-none focus:border-[#C5B3D3] shadow-sm font-semibold"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {(["all", "student", "admin"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition shadow-sm ${
                roleFilter === r
                  ? "bg-[#C5B3D3] text-plum-950 border border-[#ab92bf]"
                  : "bg-[#FBEFEF] text-plum-800 hover:bg-[#F5CBCB] border border-[#F5CBCB]"
              }`}
            >
              {r === "all" ? "All Users" : r === "admin" ? "Administrators" : "Students"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Table */}
      <div className="rounded-3xl border border-[#F5CBCB] bg-[#FFE2E2] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-plum-900">
            <thead className="bg-[#F5CBCB]/60 border-b border-[#F5CBCB] text-[11px] font-black text-plum-950 uppercase tracking-wider">
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
            <tbody className="divide-y divide-[#F5CBCB]/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-plum-600">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-plum-800" />
                    <span>Loading campus user records...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-plum-600 font-medium">
                    No users found matching &ldquo;{searchTerm}&rdquo;
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isExpanded = expandedUserId === u.campus_id;
                  return (
                    <React.Fragment key={u.campus_id}>
                      <tr className="hover:bg-[#FBEFEF]/80 transition">
                        {/* Name & Avatar */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                              u.is_admin
                                ? "bg-[#C5B3D3] text-plum-950 border border-[#ab92bf]"
                                : "bg-[#F5CBCB] text-plum-900 border border-[#F5CBCB] font-mono"
                            }`}>
                              {u.is_admin ? "ADM" : u.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-black text-plum-950 block">{u.name}</span>
                              <span className="text-[11px] text-plum-600 font-medium">Registered campus member</span>
                            </div>
                          </div>
                        </td>

                        {/* Campus ID */}
                        <td className="py-4 px-5">
                          <span className="font-mono font-bold text-plum-900 bg-[#FBEFEF] px-2.5 py-1 rounded-lg border border-[#F5CBCB] shadow-sm">
                            #{u.campus_id}
                          </span>
                        </td>

                        {/* Role */}
                        <td className="py-4 px-5">
                          {u.is_admin ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#C5B3D3] text-plum-950 font-bold border border-[#ab92bf] text-[11px] shadow-sm">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Administrator
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FBEFEF] text-plum-800 font-bold border border-[#F5CBCB] text-[11px] shadow-sm">
                              Student
                            </span>
                          )}
                        </td>

                        {/* Total Reports */}
                        <td className="py-4 px-5 text-center font-black text-plum-950">
                          {u.total_reports}
                        </td>

                        {/* Active Lost */}
                        <td className="py-4 px-5 text-center">
                          {u.lost_reports_count > 0 ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-300 text-[11px]">
                              {u.lost_reports_count} lost
                            </span>
                          ) : (
                            <span className="text-plum-400">—</span>
                          )}
                        </td>

                        {/* Active Found */}
                        <td className="py-4 px-5 text-center">
                          {u.found_reports_count > 0 ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 text-[11px]">
                              {u.found_reports_count} found
                            </span>
                          ) : (
                            <span className="text-plum-400">—</span>
                          )}
                        </td>

                        {/* Resolved */}
                        <td className="py-4 px-5 text-center">
                          {u.resolved_reports_count > 0 ? (
                            <span className="px-2 py-0.5 rounded-full bg-[#C5B3D3] text-plum-950 font-bold border border-[#ab92bf] text-[11px] flex items-center justify-center gap-1 mx-auto w-max shadow-sm">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              {u.resolved_reports_count} resolved
                            </span>
                          ) : (
                            <span className="text-plum-400">—</span>
                          )}
                        </td>

                        {/* Expand Action */}
                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => setExpandedUserId(isExpanded ? null : u.campus_id)}
                            className="p-1.5 rounded-lg bg-[#FBEFEF] hover:bg-[#F5CBCB] text-plum-800 hover:text-plum-950 border border-[#F5CBCB] transition shadow-sm"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Sub-Row with Report List */}
                      {isExpanded && (
                        <tr className="bg-[#FBEFEF] border-b border-[#F5CBCB]">
                          <td colSpan={8} className="p-5">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-plum-950 text-xs flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-plum-800" />
                                  <span>Reports filed by {u.name} (ID #{u.campus_id})</span>
                                </span>
                                <a
                                  href={`/?search=${u.campus_id}`}
                                  className="text-xs text-plum-800 font-bold hover:underline flex items-center gap-1"
                                >
                                  <span>Filter in Main Feed</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>

                              {u.recent_reports.length === 0 ? (
                                <p className="text-xs text-plum-600 italic font-medium">No reports filed yet.</p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                  {u.recent_reports.map((r) => (
                                    <a
                                      key={r.id}
                                      href={`/reports/${r.id}`}
                                      className="p-3 rounded-xl bg-[#FFE2E2] hover:bg-[#F5CBCB] border border-[#F5CBCB] transition space-y-1 block shadow-sm"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                          r.type === "lost" ? "bg-rose-100 text-rose-800 border border-rose-300" : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                        }`}>
                                          {r.type}
                                        </span>
                                        {r.status === "resolved" && (
                                          <span className="text-[10px] bg-[#C5B3D3] text-plum-950 font-bold px-1.5 py-0.5 rounded border border-[#ab92bf]">
                                            Resolved
                                          </span>
                                        )}
                                      </div>
                                      <h4 className="font-black text-plum-950 line-clamp-1">{r.title}</h4>
                                      <span className="text-[10px] text-plum-600 block truncate font-medium">📍 {r.location}</span>
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
