import { supabase } from './supabaseClient'
import type { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  email: string
  name?: string
  avatar_url?: string
  updated_at?: string
}

/**
 * Get the current authenticated user's profile
 */
export const getCurrentUser = async (): Promise<{ user: User | null; error: Error | null }> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  } catch (error) {
    console.error('Error getting current user:', error)
    return { user: null, error: error as Error }
  }
}

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    
    // Update or create user profile
    if (data.user) {
      await upsertUserProfile(data.user)
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('Error signing in with email:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (email: string, password: string, name?: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    })
    
    if (error) throw error
    
    // Update or create user profile
    if (data.user) {
      await upsertUserProfile(data.user)
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('Error signing up with email:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error signing in with Google:', error)
    return { data: null, error: error as Error }
  }
}

/**
 * Sign out the current user
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error signing out:', error)
    return { error: error as Error }
  }
}

/**
 * Get the current user's profile from the database
 */
export const getUserProfile = async (userId: string): Promise<{ profile: Profile | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single<Profile>()
    
    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
    return { profile: data as Profile | null, error: null }
  } catch (error) {
    console.error('Error getting user profile:', error)
    return { profile: null, error: error as Error }
  }
}

/**
 * Create or update a user's profile in the database
 */
const upsertUserProfile = async (user: User): Promise<{ profile: Profile | null; error: Error | null }> => {
  try {
    const profileData = {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.full_name || user.user_metadata?.name || undefined,
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || undefined,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData)
      .select()
      .single<Profile>()
    
    if (error) throw error
    return { profile: data as Profile, error: null }
  } catch (error) {
    console.error('Error upserting user profile:', error)
    return { profile: null, error: error as Error }
  }
}

/**
 * Handle the OAuth callback and get the current session
 */
export const handleAuthCallback = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    
    // If we have a session, ensure the user's profile exists
    if (data.session?.user) {
      await upsertUserProfile(data.session.user)
    }
    
    return { session: data.session, error: null }
  } catch (error) {
    console.error('Error handling auth callback:', error)
    return { session: null, error: error as Error }
  }
}
