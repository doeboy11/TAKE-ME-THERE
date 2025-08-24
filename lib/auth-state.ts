import { supabase } from './supabaseClient'
import { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  loading: boolean
  error: Error | null
}

// Initial state
const initialState: AuthState = {
  user: null,
  loading: true,
  error: null
}

/**
 * Handles the OAuth callback by exchanging the code for a session
 * and cleaning up the URL
 */
const handleOAuthCallback = async (): Promise<void> => {
  try {
    // Check if we have an OAuth code in the URL
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    
    if (code) {
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) throw error
      
      // Clean up the URL without page reload
      const cleanUrl = window.location.origin + window.location.pathname
      window.history.replaceState({}, document.title, cleanUrl)
    }
  } catch (error) {
    console.error('Error handling OAuth callback:', error)
    // Still clean up the URL even if there's an error
    const cleanUrl = window.location.origin + window.location.pathname
    window.history.replaceState({}, document.title, cleanUrl)
  }
}

/**
 * Initializes the authentication state and sets up listeners
 */
export const initAuth = async (): Promise<AuthState> => {
  try {
    // Handle OAuth callback if needed
    await handleOAuthCallback()
    
    // Get the current user session
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) throw error
    
    return {
      user,
      loading: false,
      error: null
    }
  } catch (error) {
    console.error('Auth initialization error:', error)
    return {
      ...initialState,
      loading: false,
      error: error as Error
    }
  }
}

/**
 * Sets up authentication state change listener
 * @param callback Function to call when auth state changes
 * @returns Unsubscribe function
 */
export const onAuthStateChange = (
  callback: (event: 'SIGNED_IN' | 'SIGNED_OUT', session: { user: User | null }) => void
) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
      callback(event, { user: session?.user || null })
    }
  })
  
  return () => {
    subscription?.unsubscribe()
  }
}

/**
 * Signs out the current user
 */
export const signOut = async (): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (error) {
    console.error('Sign out error:', error)
    return { error: error as Error }
  }
}
