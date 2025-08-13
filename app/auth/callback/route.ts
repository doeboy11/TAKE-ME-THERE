import { NextResponse } from 'next/server'

export async function GET() {
  // Supabase auth helpers handle cookie setting via middleware/client.
  // This route can be expanded if using OAuth. For password logins it's a no-op.
  return NextResponse.redirect(new URL('/dashboard', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
}


