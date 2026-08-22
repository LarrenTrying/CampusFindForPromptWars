"use client";

import React, { useState } from "react";
import { useAuth, ADMIN_CAMPUS_ID } from "@/context/AuthContext";
import { Lock, User, ShieldCheck, Key, X, AlertCircle, CheckCircle2 } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, user } = useAuth();
  const [campusId, setCampusId] = useState("");
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const isAdminInput = campusId.trim() === ADMIN_CAMPUS_ID;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!/^\d{5}$/.test(campusId.trim())) {
      setErrorMsg("Campus ID must be exactly a 5-digit number (e.g. 90421 or 43554).");
      return;
    }

    if (!pin || pin.length < 3) {
      setErrorMsg("Please enter a PIN (at least 3 characters).");
      return;
    }

    const ok = login(campusId, pin, name || (isAdminInput ? "Campus Administrator" : undefined));
    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);
    } else {
      setErrorMsg("Failed to login. Please check your 5-digit ID.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
            <User className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Campus ID Login
            </h3>
            <p className="text-xs text-slate-400">
              Sign in with your 5-digit campus ID and your custom PIN.
            </p>
          </div>
        </div>

        {success ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-sm font-bold text-emerald-300">
              Logged in as {isAdminInput ? "Campus Admin (43554)" : `ID #${campusId}`}
            </h4>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campus 5-digit ID */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  5-Digit Campus ID Number <span className="text-rose-400">*</span>
                </label>
                {isAdminInput && (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Admin ID 43554
                  </span>
                )}
              </div>
              <input
                type="text"
                maxLength={5}
                value={campusId}
                onChange={(e) => setCampusId(e.target.value.replace(/\D/g, ""))}
                placeholder="e.g. 90421 or 43554 for Admin"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono tracking-widest text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400">
                Students use any 5-digit ID. Admin uses <strong className="text-indigo-300 font-mono">43554</strong>.
              </p>
            </div>

            {/* Custom PIN */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Security PIN / Password <span className="text-rose-400">*</span>
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter your secret PIN"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Optional Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Display Name (Optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Johnson"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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
              className="w-full py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition active:scale-98"
            >
              Sign In to Campus Lost & Found
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
