"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkSession = async () => {
    try {
      const data = await api.auth.getSession();
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('[AuthContext] Login called:', { email, hasPassword: !!password });
    
    try {
      const data = await api.auth.login(email, password);
      
      console.log('[AuthContext] Login successful:', {
        hasUser: !!data.user,
        user: data.user,
        message: data.message
      });
      
      if (data.user) {
        setUser(data.user);
        console.log('[AuthContext] User state updated, redirecting...');
        router.push('/');
      } else {
        console.warn('[AuthContext] Login successful but no user data received');
      }
    } catch (error) {
      console.error('[AuthContext] Login error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        errorType: error?.constructor?.name
      });
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    const data = await api.auth.register(email, password, name);
    if (data.user) {
      setUser(data.user);
      router.push('/');
    }
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

