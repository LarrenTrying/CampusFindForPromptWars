"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CampusUser {
  campus_id: string; // 5-digit ID
  name: string;
  is_admin: boolean;
}

interface AuthContextType {
  user: CampusUser | null;
  login: (campusId: string, password: string, name?: string) => Promise<{ success: boolean; error?: string; isNew?: boolean }>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => ({ success: false }),
  logout: () => {},
  isAdmin: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CampusUser | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("campusfind_user");
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const login = async (
    campusId: string,
    password: string,
    name?: string
  ): Promise<{ success: boolean; error?: string; isNew?: boolean }> => {
    const cleanId = campusId.trim();
    const cleanPass = password.trim();

    if (!/^\d{5}$/.test(cleanId)) {
      return { success: false, error: "Campus ID must be exactly a 5-digit number (e.g. 90421)." };
    }

    if (!cleanPass) {
      return { success: false, error: "Password is required." };
    }

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campus_id: cleanId, password: cleanPass, name }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Authentication failed." };
      }

      const campusUser: CampusUser = {
        campus_id: data.user.campus_id,
        name: data.user.name,
        is_admin: data.user.is_admin,
      };

      setUser(campusUser);
      localStorage.setItem("campusfind_user", JSON.stringify(campusUser));
      return { success: true, isNew: data.isNew };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to connect to authentication server." };
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("campusfind_user");
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAdmin: user ? user.is_admin : false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
