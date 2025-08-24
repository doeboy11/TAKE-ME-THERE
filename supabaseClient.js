// supabaseClient.js
// Centralized Supabase client used by the Forgot/Reset Password pages.
// Ensure you set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
// in your environment (e.g., .env.local for Next.js or .env for Vite/CRA).

import { createClient } from '@supabase/supabase-js'

// Read from public env vars so it works in the browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Soft warning to help during local dev; avoid crashing runtime
  // eslint-disable-next-line no-console
  console.warn('Supabase env vars are missing: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')
