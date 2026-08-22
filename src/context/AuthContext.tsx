"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";

export interface GoogleUser {
  email: string;
  name: string;
  avatar?: string;
  is_admin: boolean;
}

interface AuthContextType {
  user: GoogleUser | null;
  loginWithGoogle: (customEmail?: string, customName?: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loginWithGoogle: async () => {},
  logout: () => {},
  isAdmin: false,
});

export const ADMIN_EMAILS = [
  "campusadmin@gmail.com",
  "admin@campus.edu",
  "admin@gmail.com",
  "lostandfound@campus.edu"
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<GoogleUser | null>(null);

  useEffect(() => {
    // 1. Check local session
    try {
      const saved = localStorage.getItem("campusfind_google_user");
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch {
      // ignore
    }

    // 2. Check Supabase auth state if connected
    const supabase = getBrowserSupabase();
    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user) {
          const u = data.session.user;
          const email = u.email || "";
          const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase()) || email.toLowerCase().includes("admin");
          const gUser: GoogleUser = {
            email: email,
            name: u.user_metadata?.full_name || u.user_metadata?.name || email.split("@")[0],
            avatar: u.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
            is_admin: isAdmin,
          };
          setUser(gUser);
          localStorage.setItem("campusfind_google_user", JSON.stringify(gUser));
        }
      });
    }
  }, []);

  const loginWithGoogle = async (customEmail?: string, customName?: string) => {
    const supabase = getBrowserSupabase();

    // If Supabase OAuth is available
    if (supabase && !customEmail) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
          },
        });
        if (!error) return;
      } catch (e) {
        console.warn("Supabase Google OAuth fallback to direct session:", e);
      }
    }

    // Direct Google Mail Login / Demo Flow
    const email = (customEmail || "student.campus@gmail.com").trim().toLowerCase();
    const name = customName || email.split("@")[0].replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const isAdmin = ADMIN_EMAILS.includes(email) || email.includes("admin");

    const googleUser: GoogleUser = {
      email,
      name,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      is_admin: isAdmin,
    };

    setUser(googleUser);
    try {
      localStorage.setItem("campusfind_google_user", JSON.stringify(googleUser));
    } catch {
      // ignore
    }
  };

  const logout = () => {
    const supabase = getBrowserSupabase();
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    setUser(null);
    try {
      localStorage.removeItem("campusfind_google_user");
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loginWithGoogle,
        logout,
        isAdmin: user ? user.is_admin : false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
