import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Ensure a single client instance across HMR/browser contexts
const globalForSupabase = globalThis as unknown as { __supabase?: ReturnType<typeof createClient> };

export const supabase =
  globalForSupabase.__supabase ?? createClient(supabaseUrl, supabaseAnonKey);

if (process.env.NODE_ENV !== 'production') {
  globalForSupabase.__supabase = supabase;
}