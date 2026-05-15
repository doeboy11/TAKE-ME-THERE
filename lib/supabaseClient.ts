"use client";

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate that env vars are set and contain valid-looking values
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Create a .env.local file in the project root with:\n' +
    'NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\n' +
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here\n' +
    'Then restart the dev server.'
  );
}

// Validate that URL is a valid HTTPS URL
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('supabase.co')) {
  throw new Error(
    `Invalid NEXT_PUBLIC_SUPABASE_URL: "${supabaseUrl}"\n` +
    'Expected format: https://your-project.supabase.co\n' +
    'Get the correct URL from https://app.supabase.com/project/_/settings/api'
  );
}

// Validate that anon key looks reasonable (should be a long string)
if (supabaseAnonKey.length < 20 || supabaseAnonKey.includes('your_')) {
  throw new Error(
    `Invalid or placeholder NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local\n` +
    'Get the correct anon key from https://app.supabase.com/project/_/settings/api'
  );
}

// Ensure a single client instance across HMR/browser contexts
const globalForSupabase = globalThis as unknown as { __supabase?: ReturnType<typeof createBrowserClient> };

export const supabase =
  globalForSupabase.__supabase ?? createBrowserClient(supabaseUrl!, supabaseAnonKey!);

if (process.env.NODE_ENV !== 'production') {
  globalForSupabase.__supabase = supabase;
}
