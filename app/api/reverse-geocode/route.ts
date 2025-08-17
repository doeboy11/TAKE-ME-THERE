import { NextResponse } from 'next/server'

// Ensure this route runs on Node.js runtime (not Edge)
export const runtime = 'nodejs'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon') || searchParams.get('lng')
    const zoom = searchParams.get('zoom') || '10'

    if (!lat || !lon) {
      return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 })
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lon)}&zoom=${encodeURIComponent(zoom)}`

    // Call upstream with explicit headers. Doing this server-side avoids CORS issues in the browser.
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        // Per Nominatim usage policy: set an identifiable UA or Referer; server-side we can set UA.
        'User-Agent': 'buss-app/1.0 (contact: support@buss.local)'
      },
      // Add a conservative timeout via AbortController
      signal: AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined as any,
      cache: 'no-store',
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return NextResponse.json({ error: 'Upstream error', status: res.status, body: text }, { status: 502 })
    }

    const data = await res.json()

    // Cache at the edge for short time to reduce load; adjust as needed
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=3600'
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'reverse-geocode failed' }, { status: 500 })
  }
}
