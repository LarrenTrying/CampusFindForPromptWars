"use client";

import React from "react";
import Link from "next/navigation";
import { usePathname } from "next/navigation";
import { 
  Sparkles, 
  Search, 
  PlusCircle, 
  Layers, 
  Compass, 
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { StatusIndicator } from "./StatusIndicator";

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Explore Feed", icon: Compass },
    { href: "/submit", label: "Submit Report", icon: PlusCircle },
    { href: "/search", label: "Semantic Search", icon: Search },
    { href: "/match", label: "AI Match Hub", icon: Sparkles },
  ];

  return (
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

          {/* Right Action */}
          <div className="flex items-center gap-3">
            <StatusIndicator />
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
  );
};
