"use client";

import React, { useState, useEffect } from "react";
import { useAuth, ADMIN_EMAILS } from "@/context/AuthContext";
import { Lock, ShieldCheck, CheckCircle2, AlertCircle, Mail, User, X } from "lucide-react";
import confetti from "canvas-confetti";

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  reportTitle: string;
  sourceReportId?: string;
  reporterEmail?: string;
  onSuccess: () => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  isOpen,
  onClose,
  reportId,
  reportTitle,
  sourceReportId,
  reporterEmail,
  onSuccess,
}) => {
  const { user, isAdmin } = useAuth();
  const [emailInput, setEmailInput] = useState(user?.email || "");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [authorizedBy, setAuthorizedBy] = useState("");

  useEffect(() => {
    if (user?.email) {
      setEmailInput(user.email);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const isCurrentAdmin = user?.is_admin || isAdmin;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) {
      setErrorMsg("Please enter your Google Mail address to verify ownership.");
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
          email: emailInput.trim(),
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
            email: emailInput.trim(),
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
      setErrorMsg(err.message || "Invalid Google account or unauthorized.");
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
              Authorize Claim & Resolution
            </h3>
            <p className="text-xs text-slate-400">
              Requires Google Mail verification of the reporter or campus administrator.
            </p>
          </div>
        </div>

        {/* Item Summary */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Item</span>
            <span className="font-semibold text-slate-200 line-clamp-1">{reportTitle}</span>
          </div>
          {reporterEmail && (
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 max-w-[150px] truncate">
              {reporterEmail}
            </span>
          )}
        </div>

        {success ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-emerald-300">Identity Verified & Resolved!</h4>
            <p className="text-xs text-slate-400">
              {authorizedBy} marked this item as resolved. Moved to <span className="text-indigo-300 font-semibold">Reunited Archive</span>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Google Mail Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Google Mail Account</span>
                </label>
                {isCurrentAdmin && (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Admin Account
                  </span>
                )}
              </div>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="e.g. your.email@gmail.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Quick Demo Hint */}
            <div className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-center justify-between">
              <span>Admin account for evaluation:</span>
              <button
                type="button"
                onClick={() => setEmailInput("campusadmin@gmail.com")}
                className="bg-indigo-900/70 hover:bg-indigo-900 px-2 py-0.5 rounded text-indigo-200 font-mono font-bold text-[11px] border border-indigo-500/30 transition"
              >
                campusadmin@gmail.com
              </button>
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
              <span>{submitting ? "Verifying Google Account..." : "Verify & Resolve Case"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
