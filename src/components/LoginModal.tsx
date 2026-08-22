"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { X, ShieldCheck, CheckCircle2, AlertCircle, KeyRound, User, Hash } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [campusId, setCampusId] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!/^\d{5}$/.test(campusId.trim())) {
      setErrorMsg("Please enter a valid 5-digit campus ID (e.g. 90421).");
      return;
    }

    if (!password.trim()) {
      setErrorMsg("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const result = await login(campusId, password, name);
      if (!result.success) {
        setErrorMsg(result.error || "Authentication failed. Please check your credentials.");
      } else {
        if (result.isNew) {
          setSuccessMsg(`Welcome! Password saved for Campus ID #${campusId}.`);
        } else {
          setSuccessMsg("Signed in successfully!");
        }
        setTimeout(() => {
          setSuccessMsg("");
          onClose();
        }, 1200);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shadow-md shrink-0">
            <KeyRound className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Campus Account Sign In
            </h3>
            <p className="text-xs text-slate-400">
              Enter your 5-digit ID and password to submit and manage reports.
            </p>
          </div>
        </div>

        {successMsg ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-sm font-bold text-emerald-300">
              {successMsg}
            </h4>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 5-Digit Campus ID */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-indigo-400" />
                <span>5-Digit Campus ID</span>
              </label>
              <input
                type="text"
                maxLength={5}
                value={campusId}
                onChange={(e) => setCampusId(e.target.value.replace(/\D/g, ""))}
                placeholder="e.g. 90421"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono tracking-wider text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-500 block">
                Enter your university-assigned 5-digit ID number.
              </span>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                <span>Password / PIN</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-500 block">
                Your password is saved for this ID. Future logins will require this same password.
              </span>
            </div>

            {/* Optional Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>Full Name (Optional for new users)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Lin"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-600/25 transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? "Authenticating..." : "Sign In to CampusFind"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
