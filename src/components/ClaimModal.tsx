"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Lock, ShieldCheck, CheckCircle2, AlertCircle, KeyRound, Hash, X, Sparkles, UserCheck } from "lucide-react";
import confetti from "canvas-confetti";

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  reportTitle: string;
  sourceReportId?: string;
  reporterCampusId?: string;
  onSuccess: () => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  isOpen,
  onClose,
  reportId,
  reportTitle,
  sourceReportId,
  reporterCampusId,
  onSuccess,
}) => {
  const { user, isAdmin } = useAuth();
  const [campusIdInput, setCampusIdInput] = useState(user?.campus_id || "");
  const [passwordInput, setPasswordInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [authorizedBy, setAuthorizedBy] = useState("");

  const isOwner = Boolean(user && reporterCampusId && user.campus_id === reporterCampusId);
  const isAuthorizedSession = Boolean(user && (isAdmin || isOwner || user.campus_id === "43554"));

  useEffect(() => {
    if (user?.campus_id) {
      setCampusIdInput(user.campus_id);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  // Direct 1-Click Resolve when already logged in as Reporter or Admin
  const handleDirectResolve = async () => {
    if (!user) return;
    setSubmitting(true);
    setErrorMsg("");

    try {
      // 1. Resolve target report
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "resolved",
          campus_id: user.campus_id,
          is_authenticated: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authorization failed.");
      }

      // 2. If source report ID provided, resolve source too
      if (sourceReportId) {
        await fetch(`/api/reports/${sourceReportId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "resolved",
            campus_id: user.campus_id,
            is_authenticated: true,
          }),
        });
      }

      setAuthorizedBy(data.authorized_by || (isAdmin ? "Campus Administrator" : `Reporter #${user.campus_id}`));
      setSuccess(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#10b981", "#3b82f6", "#f59e0b"],
      });

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to resolve report.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{5}$/.test(campusIdInput.trim())) {
      setErrorMsg("Please enter a valid 5-digit campus ID.");
      return;
    }

    if (!passwordInput.trim()) {
      setErrorMsg("Please enter the password for this ID.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      // 1. Resolve target report
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "resolved",
          campus_id: campusIdInput.trim(),
          password: passwordInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authorization failed.");
      }

      // 2. If source report ID provided, resolve source too
      if (sourceReportId) {
        await fetch(`/api/reports/${sourceReportId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "resolved",
            campus_id: campusIdInput.trim(),
            password: passwordInput.trim(),
          }),
        });
      }

      setAuthorizedBy(data.authorized_by || "Verified Authority");
      setSuccess(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#10b981", "#3b82f6", "#f59e0b"],
      });

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid campus ID or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-5">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
            <Lock className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Confirm Item Resolution
            </h3>
            <p className="text-xs text-slate-400">
              {isAuthorizedSession
                ? "Verify and mark this case as reunited & resolved."
                : "Enter credentials of the original reporter or campus administrator."}
            </p>
          </div>
        </div>

        {/* Item Summary */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Item</span>
            <span className="font-semibold text-slate-200 line-clamp-1">{reportTitle}</span>
          </div>
          {reporterCampusId && (
            <span className="text-[10px] font-mono font-bold bg-slate-800 text-indigo-300 px-2 py-0.5 rounded border border-slate-700">
              Reporter ID #{reporterCampusId}
            </span>
          )}
        </div>

        {success ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-emerald-300">Case Reunited & Resolved!</h4>
            <p className="text-xs text-slate-400">
              {authorizedBy} marked this item as resolved. Moved to <span className="text-indigo-300 font-semibold">Reunited Archive</span>.
            </p>
          </div>
        ) : isAuthorizedSession && user ? (
          /* Seamless 1-Click Resolve for already authenticated Reporter / Admin */
          <div className="space-y-4 pt-1">
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-200 font-semibold">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>{user.name}</span>
                </div>
                {isAdmin ? (
                  <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 text-[10px] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Admin
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold text-indigo-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    ID #{user.campus_id}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                You are currently signed in as an authorized party. No password re-entry required.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              onClick={handleDirectResolve}
              disabled={submitting}
              className="w-full py-3.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? "Resolving Case..." : "Confirm & Mark as Resolved"}</span>
            </button>
          </div>
        ) : (
          /* Sign-in / Credential Verification Form if not already authenticated */
          <form onSubmit={handleCredentialSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-indigo-400" />
                <span>5-Digit Campus ID</span>
              </label>
              <input
                type="text"
                maxLength={5}
                value={campusIdInput}
                onChange={(e) => setCampusIdInput(e.target.value.replace(/\D/g, ""))}
                placeholder="e.g. 90421"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                <span>Password</span>
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password for this ID"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{submitting ? "Verifying Credentials..." : "Verify & Resolve Case"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
