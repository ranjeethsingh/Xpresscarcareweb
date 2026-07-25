'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 1. Define User type
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

// 2. Define Context Type Interface (includes updateProfile)
export interface AuthContextType {
  user: User | null;
  loading: boolean;
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
        const currentUser: User = { id: '1', name: 'John Doe', email: 'john@example.com' };
        setUser(currentUser);
      } catch (err) {
        console.error('Failed to load user', err);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

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
    <AuthContext.Provider value={{ user, loading, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

// 5. Custom Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};