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

      <header className="sticky top-0 z-40 w-full border-b border-[#F5CBCB] bg-[#FFE2E2]/90 backdrop-blur-md shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <a href="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#C5B3D3] via-[#F5CBCB] to-[#FFE2E2] flex items-center justify-center shadow-md shadow-[#C5B3D3]/40 group-hover:scale-105 transition border border-[#F5CBCB]">
                  <Sparkles className="w-5 h-5 text-plum-900" />
                </div>
                <div>
                  <span className="text-lg font-black text-plum-950 tracking-tight">
                    CampusFind AI
                  </span>
                  <span className="text-xs font-bold text-plum-800 ml-1.5 px-2 py-0.5 rounded-full bg-[#F5CBCB]/60 border border-[#F5CBCB]">
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
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition ${
                      isActive
                        ? "bg-[#C5B3D3]/50 text-plum-950 border border-[#C5B3D3] shadow-sm"
                        : "text-plum-800 hover:text-plum-950 hover:bg-[#F5CBCB]/40"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-plum-950" : "text-plum-700"}`} />
                    <span>{link.label}</span>
                  </a>
                );
              })}
            </nav>

            {/* Right Action: 5-Digit User Auth State + Report Item Action */}
            <div className="flex items-center gap-3">
              <StatusIndicator />

              {user ? (
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#FBEFEF] border border-[#F5CBCB] text-xs shadow-sm">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-[11px] ${
                    isAdmin
                      ? "bg-[#C5B3D3] text-plum-950 border border-[#C5B3D3]"
                      : "bg-[#F5CBCB] text-plum-900 border border-[#F5CBCB]"
                  }`}>
                    {isAdmin ? "ADM" : "#"}
                  </div>

                  <div className="flex flex-col text-left">
                    <span className="font-bold text-plum-900 line-clamp-1 max-w-[120px]">
                      {user.name}
                    </span>
                    {isAdmin ? (
                      <span className="text-[10px] text-plum-700 font-bold flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5 text-plum-900" />
                        Admin
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-plum-700">
                        ID #{user.campus_id}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="ml-1 text-plum-500 hover:text-rose-600 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#C5B3D3] hover:bg-[#b8a3c8] text-plum-950 shadow-sm border border-[#ab92bf] transition active:scale-95"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}

              <a
                href="/submit"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-[#C5B3D3] via-[#e5adad] to-[#F5CBCB] hover:brightness-105 text-plum-950 shadow-md shadow-[#C5B3D3]/30 border border-[#C5B3D3] transition transform active:scale-95"
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
