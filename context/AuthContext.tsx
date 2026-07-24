"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  user: any | null;
  setUser: (user: any) => void;
  loading: boolean;
  hasProfile: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkUserFromStorage = () => {
    try {
      const stored = localStorage.getItem("xpress_user");
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserFromStorage();

    // Listen to changes across tabs/windows or manual triggers
    const handleStorageChange = () => checkUserFromStorage();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const logout = () => {
    try {
      localStorage.removeItem("xpress_user");
      localStorage.removeItem("xpress_prefill");
      localStorage.removeItem("xpress_otp_target");
    } catch {}
    setUser(null);
  };

  const hasProfile = Boolean(user && user.name && user.phone);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, hasProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};