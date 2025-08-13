"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();

  // Sign up with Supabase
  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          name: name
        }
      }
    });
    setIsLoading(false);
    if (error) return false;
    if (data.user) {
      setUser({ 
        id: data.user.id, 
        email: data.user.email!,
        name: data.user.user_metadata?.name || name,
        role: (data.user.app_metadata as any)?.role || (data.user.user_metadata as any)?.role
      });
      return true;
    }
    return false;
  };

  // Login with Supabase
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    if (error) return false;
    if (data.user) {
      setUser({ 
        id: data.user.id, 
        email: data.user.email!,
        name: data.user.user_metadata?.name,
        role: (data.user.app_metadata as any)?.role || (data.user.user_metadata as any)?.role
      });
      return true;
    }
    return false;
  };

  // Logout with Supabase
  const logout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setIsLoading(false);
  };

  // Listen for auth state changes
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({ 
          id: session.user.id, 
          email: session.user.email!,
          name: session.user.user_metadata?.name,
          role: (session.user.app_metadata as any)?.role || (session.user.user_metadata as any)?.role
        });
      } else {
        setUser(null);
      }
    });
    // Check initial session
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ 
          id: data.user.id, 
          email: data.user.email!,
          name: data.user.user_metadata?.name,
          role: (data.user.app_metadata as any)?.role || (data.user.user_metadata as any)?.role
        });
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
} 