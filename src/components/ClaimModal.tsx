"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Lock, ShieldCheck, CheckCircle2, AlertCircle, KeyRound, Hash, X, UserCheck } from "lucide-react";
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
        colors: ["#C5B3D3", "#F5CBCB", "#FFE2E2", "#10b981"],
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
        colors: ["#C5B3D3", "#F5CBCB", "#FFE2E2", "#10b981"],
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-[#FFE2E2] border border-[#F5CBCB] p-6 sm:p-8 shadow-2xl space-y-5 text-plum-950">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-plum-600 hover:text-plum-950 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#C5B3D3]/50 border border-[#ab92bf] flex items-center justify-center">
            <Lock className="w-5 h-5 text-plum-900" />
          </div>
          <div>
            <h3 className="text-base font-black text-plum-950">
              Confirm Item Resolution
            </h3>
            <p className="text-xs text-plum-700 font-medium">
              {isAuthorizedSession
                ? "Verify and mark this case as reunited & resolved."
                : "Enter credentials of the original reporter or campus administrator."}
            </p>
          </div>
        </div>

        {/* Item Summary */}
        <div className="p-3.5 rounded-xl bg-[#FBEFEF] border border-[#F5CBCB] text-xs flex items-center justify-between shadow-sm">
          <div>
            <span className="text-plum-600 block text-[10px] uppercase font-bold">Item</span>
            <span className="font-bold text-plum-950 line-clamp-1">{reportTitle}</span>
          </div>
          {reporterCampusId && (
            <span className="text-[10px] font-mono font-bold bg-[#F5CBCB] text-plum-950 px-2 py-0.5 rounded border border-[#F5CBCB]">
              Reporter ID #{reporterCampusId}
            </span>
          )}
        </div>

        {success ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="text-base font-black text-emerald-800">Case Reunited & Resolved!</h4>
            <p className="text-xs text-plum-700">
              {authorizedBy} marked this item as resolved. Moved to <span className="text-plum-950 font-bold">Reunited Archive</span>.
            </p>
          </div>
        ) : isAuthorizedSession && user ? (
          /* Seamless 1-Click Resolve for already authenticated Reporter / Admin */
          <div className="space-y-4 pt-1">
            <div className="p-4 rounded-2xl bg-[#FBEFEF] border border-[#F5CBCB] space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-plum-950 font-bold">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>{user.name}</span>
                </div>
                {isAdmin ? (
                  <span className="px-2 py-0.5 rounded-lg bg-[#C5B3D3] text-plum-950 font-bold border border-[#ab92bf] text-[10px] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Admin
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold text-plum-900 bg-[#FFE2E2] px-2 py-0.5 rounded border border-[#F5CBCB]">
                    ID #{user.campus_id}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-plum-700 font-medium">
                You are currently signed in as an authorized party. No password re-entry required.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              onClick={handleDirectResolve}
              disabled={submitting}
              className="w-full py-3.5 rounded-xl text-xs font-bold bg-[#6ea17e] hover:bg-[#5e916e] text-white shadow-md border border-[#9ec0aa] transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? "Resolving Case..." : "Confirm & Mark as Resolved"}</span>
            </button>
          </div>
        ) : (
          /* Sign-in / Credential Verification Form if not already authenticated */
          <form onSubmit={handleCredentialSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-plum-900 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-plum-700" />
                <span>5-Digit Campus ID</span>
              </label>
              <input
                type="text"
                maxLength={5}
                value={campusIdInput}
                onChange={(e) => setCampusIdInput(e.target.value.replace(/\D/g, ""))}
                placeholder="e.g. 90421"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBEFEF] border border-[#F5CBCB] text-sm font-mono text-plum-950 placeholder-plum-400 focus:outline-none focus:border-[#C5B3D3] shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-plum-900 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-plum-700" />
                <span>Password</span>
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password for this ID"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBEFEF] border border-[#F5CBCB] text-sm text-plum-950 placeholder-plum-400 focus:outline-none focus:border-[#C5B3D3] shadow-sm"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl text-xs font-bold bg-[#6ea17e] hover:bg-[#5e916e] text-white shadow-md border border-[#9ec0aa] transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
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
