import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function GET() {
  try {
    const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const envKeyPresent = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const supabase = createRouteHandlerClient({ cookies })

    // Head request with count to avoid payload
    const { count, error } = await supabase
      .from('businesses')
      .select('id', { count: 'exact', head: true })
      .eq('approval_status', 'approved')

    const payload: any = {
      supabaseUrlSet: !!envUrl,
      anonKeySet: envKeyPresent,
      approvedBusinessesCount: typeof count === 'number' ? count : null,
      supabaseError: error ? { message: (error as any)?.message, code: (error as any)?.code } : null,
    }

    return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'health check failed' }, { status: 500 })
  }
}
