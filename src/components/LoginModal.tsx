"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { X, Mail, ShieldCheck, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle, loginWithCustomEmail, user } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleRealGoogleOAuth = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      await loginWithGoogle();
      // Browser will redirect to accounts.google.com
    } catch (err: any) {
      console.warn("Google OAuth popup / redirect notice:", err.message);
      setErrorMsg(
        err.message?.includes("provider is not enabled")
          ? "Google OAuth provider is not yet enabled in your Supabase Auth dashboard. You can enable it in Supabase > Auth > Providers, or sign in below with your Google email."
          : (err.message || "Failed to initialize Google Sign-In.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCustomEmailSignIn = async (targetEmail: string, targetName?: string) => {
    setLoading(true);
    setErrorMsg("");
    try {
      await loginWithCustomEmail(targetEmail, targetName);
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
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-md shrink-0">
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
              Direct Google authentication for reporting and claiming items.
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
            {/* Primary Google Real OAuth Button */}
            <button
              type="button"
              onClick={handleRealGoogleOAuth}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl flex items-center justify-center gap-3 transition active:scale-98 disabled:opacity-70"
            >
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
              <span>{loading ? "Redirecting to Google..." : "Continue with Google (accounts.google.com)"}</span>
            </button>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Google Provider Setup Notice</span>
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">{errorMsg}</p>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1 h-[1px] bg-slate-800" />
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                Or Direct Sign In with Your Gmail
              </span>
              <div className="flex-1 h-[1px] bg-slate-800" />
            </div>

            {/* Custom Google Email Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email) handleCustomEmailSignIn(email, name);
              }}
              className="space-y-3"
            >
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Enter Your Google Mail Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  required
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
                Sign In with this Google Email
              </button>
            </form>

            {/* Admin Demo Login */}
            <div className="pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => handleCustomEmailSignIn("campusadmin@gmail.com", "Campus Administrator")}
                className="w-full p-2.5 rounded-xl bg-amber-950/20 hover:bg-amber-950/40 border border-amber-500/30 text-xs text-left text-amber-200 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-amber-300">Campus Admin Demo Login</span>
                </div>
                <span className="text-[11px] font-mono text-amber-400/80">campusadmin@gmail.com</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
