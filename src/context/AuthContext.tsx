"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CampusUser {
  campus_id: string; // 5-digit ID
  name: string;
  is_admin: boolean;
  pin?: string;
}

interface AuthContextType {
  user: CampusUser | null;
  login: (campusId: string, pin: string, name?: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => false,
  logout: () => {},
  isAdmin: false,
});

export const ADMIN_CAMPUS_ID = "43554";

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

  const login = (campusId: string, pin: string, name?: string): boolean => {
    const cleanId = campusId.trim();
    // Validate 5-digit number
    if (!/^\d{5}$/.test(cleanId)) {
      return false;
    }

    const isAdmin = cleanId === ADMIN_CAMPUS_ID;
    const campusUser: CampusUser = {
      campus_id: cleanId,
      name: name || (isAdmin ? "Campus Administrator" : `Student #${cleanId}`),
      is_admin: isAdmin,
      pin: pin,
    };

    setUser(campusUser);
    try {
      localStorage.setItem("campusfind_user", JSON.stringify(campusUser));
    } catch {
      // ignore
    }
    return true;
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
        isAdmin: user?.campus_id === ADMIN_CAMPUS_ID,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
