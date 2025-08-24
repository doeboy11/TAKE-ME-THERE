'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { initAuth, onAuthStateChange, signOut as signOutUser } from '@/lib/auth-state'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: Error | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    user: User | null
    loading: boolean
    error: Error | null
  }>({
    user: null,
    loading: true,
    error: null,
  })

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const authState = await initAuth()
        setState(authState)
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        setState({
          user: null,
          loading: false,
          error: error as Error,
        })
      }
    }

    initializeAuth()

    // Set up auth state change listener
    const unsubscribe = onAuthStateChange((event, { user }) => {
      setState(prev => ({
        ...prev,
        user,
        loading: false,
      }))
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      await signOutUser()
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        loading: state.loading,
        error: state.error,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
