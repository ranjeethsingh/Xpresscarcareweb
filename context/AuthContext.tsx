'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 1. User Type
export interface User {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl?: string;
}

// 2. Define Context Type Interface (includes login and updateProfile)
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// 3. Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 4. Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // TODO: replace with real session check (e.g. check cookie/token, fetch current user)
        // Leaving this null means "not logged in" until login() is called.
        setUser(null);
      } catch (err) {
        console.error('Failed to load user', err);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  // 5. Login - stores an already-verified user (verification happens at the call site, e.g. OTP page)
  const login = async (loggedInUser: User) => {
    try {
      setUser(loggedInUser);
    } catch (err) {
      console.error('Login failed:', err);
      throw err;
    }
  };

  const logout = async () => {
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      setUser((prevUser) => (prevUser ? { ...prevUser, ...data } : null));
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

// 6. Custom Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};