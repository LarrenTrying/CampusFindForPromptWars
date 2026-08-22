"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LoginModal } from "./LoginModal";
import { 
  Sparkles, 
  Search, 
  PlusCircle, 
  Compass, 
  Users,
  ShieldCheck,
  LogOut,
  KeyRound
} from "lucide-react";
import { StatusIndicator } from "./StatusIndicator";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Clean Navigation Links (Submit Report next to Explore Feed removed, AI Match Hub removed)
  const navLinks = [
    { href: "/", label: "Explore Feed", icon: Compass },
    { href: "/search", label: "Semantic Search", icon: Search },
    ...(isAdmin ? [{ href: "/users", label: "User Directory", icon: Users }] : []),
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
            <nav className="hidden md:flex items-center gap-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition ${
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

            {/* Right Action: 5-Digit User Auth State + Report Item Action */}
            <div className="flex items-center gap-3">
              <StatusIndicator />

              {user ? (
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-[11px] ${
                    isAdmin
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-indigo-600/30 border border-indigo-500/50 text-indigo-300"
                  }`}>
                    {isAdmin ? "ADM" : "#"}
                  </div>

                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-slate-200 line-clamp-1 max-w-[120px]">
                      {user.name}
                    </span>
                    {isAdmin ? (
                      <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        Admin
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-indigo-300">
                        ID #{user.campus_id}
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
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition active:scale-95"
                >
                  <KeyRound className="w-3.5 h-3.5" />
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
