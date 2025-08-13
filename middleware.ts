import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

  // Only guard admin routes; avoid any auth calls for others
  if (!isAdminRoute) return res

  const supabase = createMiddlewareClient({ req, res })
  try {
    // Use session to avoid extra network calls; handle gracefully if it fails
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    const user = session?.user
    if (!user) return NextResponse.redirect(new URL('/login', req.url))

    const role = (user.app_metadata as any)?.role || (user.user_metadata as any)?.role
    if (role !== 'admin') return NextResponse.redirect(new URL('/', req.url))

    return res
  } catch (_) {
    // Fail safe: send user to login if we cannot validate session
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: ['/admin/:path*']
}


