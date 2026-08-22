"use client";

import React, { useState } from "react";
import { useAuth, ADMIN_EMAILS } from "@/context/AuthContext";
import { X, Mail, ShieldCheck, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle, user } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async (overrideEmail?: string, overrideName?: string) => {
    setLoading(true);
    try {
      const targetEmail = overrideEmail || email || "student@gmail.com";
      const targetName = overrideName || name;
      await loginWithGoogle(targetEmail, targetName);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);
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
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-md">
            {/* Google "G" SVG */}
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Sign in with Google Mail
            </h3>
            <p className="text-xs text-slate-400">
              Authenticate your campus account to submit and resolve reports.
            </p>
          </div>
        </div>

        {success ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-sm font-bold text-emerald-300">
              Signed in successfully!
            </h4>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Primary Google One-Click Button */}
            <button
              type="button"
              onClick={() => handleGoogleSignIn()}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl flex items-center justify-center gap-3 transition active:scale-98"
            >
              {/* Google G logo */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? "Connecting to Google..." : "Continue with Google"}</span>
            </button>

            <div className="flex items-center gap-2 pt-2">
              <div className="flex-1 h-[1px] bg-slate-800" />
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                Or Sign In with Specific Gmail
              </span>
              <div className="flex-1 h-[1px] bg-slate-800" />
            </div>

            {/* Custom Google Email Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleGoogleSignIn(email, name);
              }}
              className="space-y-3"
            >
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Google Mail Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.name@gmail.com or @campus.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Lin"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition active:scale-98"
              >
                Sign In with this Google Account
              </button>
            </form>

            {/* Demo / Admin Quick Logins */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 block">Quick Demo Logins:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn("sarah.lin@gmail.com", "Sarah Lin")}
                  className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-left text-slate-300 transition"
                >
                  <div className="font-semibold text-white">Sarah Lin</div>
                  <div className="text-[10px] text-slate-500 truncate">sarah.lin@gmail.com</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleGoogleSignIn("campusadmin@gmail.com", "Campus Administrator")}
                  className="p-2 rounded-xl bg-amber-950/20 hover:bg-amber-950/40 border border-amber-500/30 text-[11px] text-left text-amber-200 transition"
                >
                  <div className="font-semibold text-amber-300 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Admin
                  </div>
                  <div className="text-[10px] text-amber-400/70 truncate">campusadmin@gmail.com</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
