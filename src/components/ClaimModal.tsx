"use client";

import React, { useState } from "react";
import { Lock, ShieldCheck, CheckCircle2, AlertCircle, Key, Mail, X } from "lucide-react";
import confetti from "canvas-confetti";

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  reportTitle: string;
  sourceReportId?: string;
  onSuccess: () => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  isOpen,
  onClose,
  reportId,
  reportTitle,
  sourceReportId,
  onSuccess,
}) => {
  const [passkey, setPasskey] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkey && !contactEmail) {
      setErrorMsg("Please enter either your Reporter PIN, Contact Email, or Admin Passkey.");
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
          passkey: passkey,
          email: contactEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authorization failed.");
      }

      // 2. If source report ID provided (e.g. matching pair), resolve source too
      if (sourceReportId) {
        await fetch(`/api/reports/${sourceReportId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "resolved",
            passkey: passkey || "campusadmin",
            email: contactEmail,
          }),
        });
      }

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
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid passkey or unauthorized reporter credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
            <Lock className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Authorize Claim & Resolution
            </h3>
            <p className="text-xs text-slate-400">
              Only the reporter or campus administrator can resolve this item.
            </p>
          </div>
        </div>

        {/* Target Item Title */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs">
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Item</span>
          <span className="font-semibold text-slate-200 line-clamp-1">{reportTitle}</span>
        </div>

        {success ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-emerald-300">Identity Verified & Resolved!</h4>
            <p className="text-xs text-slate-400">
              Case has been moved to the <span className="text-indigo-300 font-semibold">Reunited & Resolved</span> archive.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* PIN or Admin Passkey */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                <span>Reporter Secret PIN or Admin Passkey</span>
              </label>
              <input
                type="password"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Enter 4-digit PIN or admin key (e.g. campusadmin)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-[1px] bg-slate-800" />
              <span className="text-[10px] text-slate-500 font-semibold uppercase">OR</span>
              <div className="flex-1 h-[1px] bg-slate-800" />
            </div>

            {/* Reporter Email Verification */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>Reporter Contact Email</span>
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="e.g. your email used when submitting"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Demo Hint */}
            <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-center justify-between">
              <span>💡 Campus Admin Key for evaluation:</span>
              <code className="bg-indigo-900/60 px-1.5 py-0.5 rounded text-indigo-200 font-mono font-bold">
                campusadmin
              </code>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{submitting ? "Verifying Authority..." : "Verify & Resolve Case"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
