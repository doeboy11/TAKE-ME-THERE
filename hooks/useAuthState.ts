import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string | null;
  created_at?: string;
}

export function useAuthState() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Ensure profile exists in the database
  const ensureProfile = async (userData: any) => {
    if (!userData) return null;

    try {
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!existingProfile) {
        // Create new profile for the user
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: userData.id,
              email: userData.email,
              full_name: userData.user_metadata?.full_name || userData.email.split('@')[0],
              avatar_url: userData.user_metadata?.avatar_url || null,
              created_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (insertError) throw insertError;
        return newProfile;
      }

      return existingProfile;
    } catch (err) {
      console.error('Profile error:', err);
      setError(err as Error);
      return null;
    }
  };

  // Handle OAuth sign-in
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  // Handle sign out
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  // Handle auth state changes
  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        if (!session?.user) {
          setLoading(false);
          return;
        }

        // Ensure profile exists and get user data
        const profile = await ensureProfile(session.user);
        setUser({
          ...session.user,
          profile,
        });
      } catch (err) {
        console.error('Session error:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await ensureProfile(session.user);
          setUser({
            ...session.user,
            profile,
          });
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    // Clean up URL after OAuth redirect
    if (typeof window !== 'undefined' && window.location.search.includes('code=')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut,
  };
}
