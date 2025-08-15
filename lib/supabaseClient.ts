"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Ensure a single client instance across HMR/browser contexts
const globalForSupabase = globalThis as unknown as { __supabase?: ReturnType<typeof createClientComponentClient> };

export const supabase =
  globalForSupabase.__supabase ?? createClientComponentClient();

if (process.env.NODE_ENV !== 'production') {
  globalForSupabase.__supabase = supabase;
}