"use client";

import React, { useState } from "react";
import Link from "next/navigation";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LoginModal } from "./LoginModal";
import { 
  Sparkles, 
  Search, 
  PlusCircle, 
  Layers, 
  Compass, 
  CheckCircle,
  HelpCircle,
  User,
  ShieldCheck,
  LogOut
} from "lucide-react";
import { StatusIndicator } from "./StatusIndicator";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Explore Feed", icon: Compass },
    { href: "/submit", label: "Submit Report", icon: PlusCircle },
    { href: "/search", label: "Semantic Search", icon: Search },
    { href: "/match", label: "AI Match Hub", icon: Sparkles },
  ];

  return (
    <>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <a href="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                    CampusFind AI
                  </span>
                  <span className="text-xs font-semibold text-indigo-400 ml-1.5 px-1.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                    Smart Campus Lost & Found
                  </span>
                </div>
              </a>
            </div>

            {/* Nav Items */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                    <span>{link.label}</span>
                  </a>
                );
              })}
            </nav>

            {/* Right Action: Google User Auth + Status */}
            <div className="flex items-center gap-3">
              <StatusIndicator />

              {/* Google User State */}
              {user ? (
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-5 h-5 rounded-full object-cover border border-indigo-500/50"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                      {user.name.charAt(0)}
                    </div>
                  )}

                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-slate-200 line-clamp-1 max-w-[100px] sm:max-w-[140px]">
                      {user.name}
                    </span>
                    {isAdmin ? (
                      <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        Admin
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 truncate max-w-[100px] sm:max-w-[140px]">
                        {user.email}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="ml-1 text-slate-500 hover:text-rose-400 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-900 shadow-sm transition active:scale-95"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
                  <span>Sign In</span>
                </button>
              )}

              <a
                href="/submit"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-600/20 transition transform active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report Item</span>
              </a>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
