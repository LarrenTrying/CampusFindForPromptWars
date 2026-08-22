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
  loginWithGoogle: () => Promise<void>;
  loginWithCustomEmail: (email: string, name?: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loginWithGoogle: async () => {},
  loginWithCustomEmail: async () => {},
  logout: () => {},
  isAdmin: false,
});

export const ADMIN_EMAILS = [
  "campusadmin@gmail.com",
  "admin@campus.edu",
  "admin@gmail.com",
  "lostandfound@campus.edu",
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<GoogleUser | null>(null);

  const updateUserFromSession = (supabaseUser: any) => {
    if (!supabaseUser || !supabaseUser.email) return;
    const email = supabaseUser.email.toLowerCase();
    const isAdmin =
      ADMIN_EMAILS.includes(email) ||
      email.includes("admin") ||
      supabaseUser.user_metadata?.is_admin === true;

    const gUser: GoogleUser = {
      email,
      name:
        supabaseUser.user_metadata?.full_name ||
        supabaseUser.user_metadata?.name ||
        supabaseUser.user_metadata?.preferred_username ||
        email.split("@")[0],
      avatar:
        supabaseUser.user_metadata?.avatar_url ||
        supabaseUser.user_metadata?.picture ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
      is_admin: isAdmin,
    };

    setUser(gUser);
    try {
      localStorage.setItem("campusfind_google_user", JSON.stringify(gUser));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    // 1. Restore cached session
    try {
      const saved = localStorage.getItem("campusfind_google_user");
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch {
      // ignore
    }

    // 2. Connect to Supabase Auth and listen to Google OAuth callbacks
    const supabase = getBrowserSupabase();
    if (supabase) {
      // Check active Supabase session
      supabase.auth.getSession().then(({ data }) => {
        if (data?.session?.user) {
          updateUserFromSession(data.session.user);
        }
      });

      // Listen for OAuth sign-in / redirect events
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          updateUserFromSession(session.user);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          localStorage.removeItem("campusfind_google_user");
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Real Google OAuth redirect via Supabase
  const loginWithGoogle = async () => {
    const supabase = getBrowserSupabase();

    if (supabase) {
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}`
          : "http://localhost:3000";

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.warn("Supabase Google OAuth error:", error.message);
        throw error;
      }
      return;
    }

    // Fallback if Supabase credentials are not connected
    throw new Error("Supabase is not configured with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  };

  // Direct login for development or demo accounts
  const loginWithCustomEmail = async (customEmail: string, customName?: string) => {
    const email = customEmail.trim().toLowerCase();
    const name =
      customName ||
      email.split("@")[0].replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase());
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

  const logout = async () => {
    const supabase = getBrowserSupabase();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
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
        loginWithCustomEmail,
        logout,
        isAdmin: user ? user.is_admin : false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
