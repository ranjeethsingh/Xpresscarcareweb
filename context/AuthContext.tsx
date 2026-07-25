'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 1. Define your User data shape
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

// 2. Define the Auth Context Interface (Include updateProfile here!)
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// 3. Create Context with an initial undefined default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 4. Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Example: Load user state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Replace with your actual initial user fetching logic
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

  // Logout Function
  const logout = async () => {
    // Perform API call / token removal here
    setUser(null);
  };

  // 🟢 Update Profile Function implementation
  const updateProfile = async (data: Partial<User>) => {
    try {
      // Perform your API update request here:
      // await api.patch('/user/profile', data);

      // Update state locally
      setUser((prevUser) => (prevUser ? { ...prevUser, ...data } : null));
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err; // Re-throw so your UI component can catch it in `setError`
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

// 5. Custom Hook with Type Guard
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};