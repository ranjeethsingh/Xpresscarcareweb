'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 1. Define User type
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
}

// 2. Define Context Type Interface (includes login and updateProfile)
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (target: string, otp: string) => Promise<void>;
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

  // 5. Login - verifies OTP against a target (email or phone) and sets the user
  const login = async (target: string, otp: string) => {
    try {
      // TODO: replace with your real API call, e.g.:
      // const res = await fetch('/api/auth/verify-otp', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ target, otp }),
      // });
      // if (!res.ok) throw new Error('Invalid OTP');
      // const loggedInUser: User = await res.json();

      const loggedInUser: User = {
        id: '1',
        name: 'John Doe',
        email: target.includes('@') ? target : 'john@example.com',
        phone: target.includes('@') ? undefined : target,
      };

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
