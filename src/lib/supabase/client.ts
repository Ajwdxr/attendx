// ============================================================
// AttendX — Supabase Client (Browser)
// ============================================================

import { createBrowserClient } from '@supabase/ssr';

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_url_here') {
    // Return a mock client that doesn't crash
    console.warn('[AttendX] Supabase not configured. Please update .env.local with your Supabase credentials.');
  }

  const validUrl = supabaseUrl && supabaseUrl !== 'your_supabase_url_here' ? supabaseUrl : 'https://placeholder.supabase.co';
  const validKey = supabaseKey && supabaseKey !== 'your_supabase_anon_key_here' ? supabaseKey : 'placeholder-key';

  client = createBrowserClient(validUrl, validKey);

  return client;
}
