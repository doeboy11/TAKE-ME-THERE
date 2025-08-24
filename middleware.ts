import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/auth/callback',
  '/business',
  '/business/[id]',
  '/about',
  '/contact',
  '/privacy',
  '/terms'
]

// Paths that should redirect to dashboard if user is already authenticated
const AUTH_PATHS = ['/login', '/signup']

// Paths that require authentication
const PROTECTED_PATHS = ['/dashboard', '/profile', '/settings']

// Admin paths that require admin role
const ADMIN_PATHS = ['/admin']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const { pathname, searchParams } = req.nextUrl
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  
  // Skip middleware for public paths and static files
  if (
    PUBLIC_PATHS.some(path => pathname.startsWith(path)) ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    // If user is already authenticated and trying to access auth pages, redirect to dashboard
      if (AUTH_PATHS.some(path => pathname.startsWith(path))) {
        const supabase = createMiddlewareClient({ req, res })
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          return NextResponse.redirect(new URL(redirectTo, req.url))
        }
      }
      
      return res
  }

  const supabase = createMiddlewareClient({ req, res })
  
  try {
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      throw sessionError
    }

    // Handle OAuth callback
    if (pathname === '/auth/callback') {
      if (session) {
        // Ensure user has a profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle()

        if (profileError) {
          console.error('Profile check error:', profileError)
          throw profileError
        }

        if (!profile) {
          // Create profile if it doesn't exist
          const { error: upsertError } = await supabase
            .from('profiles')
            .upsert({
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
              avatar_url: session.user.user_metadata?.avatar_url || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

          if (upsertError) {
            console.error('Profile creation error:', upsertError)
            throw upsertError
          }
        }
      }

      // Redirect to the intended URL or dashboard
      const redirectTo = searchParams.get('redirectedFrom') || '/dashboard'
      return NextResponse.redirect(new URL(redirectTo, req.url))
    }

    // Check if the path is protected
    const isProtectedPath = PROTECTED_PATHS.some(path => pathname.startsWith(path))
    const isAdminPath = ADMIN_PATHS.some(path => pathname.startsWith(path))

    // Redirect to login if not authenticated and trying to access protected path
    if (!session && (isProtectedPath || isAdminPath)) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check admin access
    if (isAdminPath && session) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profileError || profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    return res
  } catch (error) {
    console.error('Auth error:', error)
    
    // Don't redirect to login if we're already on the login page
    if (pathname === '/login') {
      return res
    }
    
    // In case of error, redirect to login with error message
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('error', 'auth_error')
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}


