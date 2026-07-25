'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 1. Define User type — includes every field referenced across the app
export interface User {
  id: string;
  name: string | null;
  first_name?: string;
  last_name?: string;
  email: string | null;
  phone?: string | null;
  address?: string;
  avatarUrl?: string;
}

// 2. Define Context Type Interface (includes login and updateProfile)
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => Promise<void>;
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

  // 5. Login - accepts a user object (e.g. from OTP verification response) and stores it
  const login = async (userData: User) => {
    try {
      // TODO: if you need to persist a session/token, do it here too
      // e.g. localStorage.setItem('xpress_session', JSON.stringify(userData));
      setUser(userData);
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
