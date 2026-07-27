'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useInactivityLogout } from '@/hooks/useInactivityLogout';

const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

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
  hasProfile: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// 3. Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 4. Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Restore session from localStorage (written by login/page.tsx and the OTP flow)
        const stored = localStorage.getItem('xpress_user');
        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to load user', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  // 5. Login - accepts a user object (e.g. from OTP verification response) and stores it
  const login = async (userData: User) => {
    try {
      localStorage.setItem('xpress_user', JSON.stringify(userData));
      setUser(userData);
    } catch (err) {
      console.error('Login failed:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('xpress_user');
      localStorage.removeItem('xpress_prefill');
      // Clear Firebase's own session too, otherwise the next "Continue with
      // Google" click can stay tied to this account under the hood even
      // after picking a different one in the account chooser.
      if (auth.currentUser) {
        await signOut(auth);
      }
    } catch (err) {
      console.error('Error clearing session:', err);
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      setUser((prevUser) => {
        const next = prevUser ? { ...prevUser, ...data } : null;
        if (next) {
          localStorage.setItem('xpress_user', JSON.stringify(next));
        }
        return next;
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  };

  // Auto-logout after 5 minutes of no mouse/keyboard/scroll/touch activity,
  // only while someone is actually logged in. Skip on /admin — that's a
  // separate staff session, not this customer one.
  const handleInactivityLogout = async () => {
    await logout();
    router.push('/login?reason=inactivity');
  };

  useInactivityLogout(
    handleInactivityLogout,
    INACTIVITY_TIMEOUT_MS,
    Boolean(user) && !pathname?.startsWith('/admin')
  );

  // A profile counts as "complete" once both name and phone are set
  const hasProfile = Boolean(user && user.name && user.phone);

  return (
    <AuthContext.Provider value={{ user, loading, hasProfile, login, logout, updateProfile }}>
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
