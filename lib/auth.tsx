"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabaseClient";
import { Session } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>; // Alias for logout for consistency
  isLoading: boolean;
  isInitializing: boolean;
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

/**
 * Handles the OAuth callback by exchanging the code for a session
 * and cleaning up the URL
 */
const handleOAuthCallback = async (): Promise<boolean> => {
  try {
    // Check if we have an OAuth code in the URL
    if (typeof window === 'undefined') return false;
    
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      // Clean up the URL without page reload
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      
      if (error) {
        console.error('Error exchanging code for session:', error);
        return false;
      }
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    // Still clean up the URL even if there's an error
    if (typeof window !== 'undefined') {
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
    return false;
  }
};

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

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
  
  // Alias for logout for consistency with Supabase's auth.signOut()
  const signOut = logout;

  // Initialize auth state and handle OAuth callback
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Handle OAuth callback if needed
        const isOAuthCallback = await handleOAuthCallback();
        
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name,
            role: (session.user.app_metadata as any)?.role || (session.user.user_metadata as any)?.role,
            avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsInitializing(false);
      }
    };
    
    initializeAuth();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: Session | null) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser({ 
          id: session.user.id, 
          email: session.user.email!,
          name: session.user.user_metadata?.name,
          role: (session.user.app_metadata as any)?.role || (session.user.user_metadata as any)?.role,
          avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture
        });
        
        // If this was an OAuth sign-in, redirect to dashboard
        if (event === 'SIGNED_IN') {
          router.push('/dashboard');
        }
      } else {
        setUser(null);
      }
    });
    // Check initial session
    return () => {
      subscription?.unsubscribe();
    };
  }, [router]);

  const value = useMemo(() => ({
    user,
    login,
    signup,
    logout,
    signOut,
    isLoading,
    isInitializing,
  }), [user, isLoading, isInitializing]);

  return (
    <AuthContext.Provider value={value}>
      {!isInitializing && children}
    </AuthContext.Provider>
  );
}