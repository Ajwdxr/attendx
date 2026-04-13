// ============================================================
// AttendX — Supabase Server Client
// ============================================================

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const validUrl = supabaseUrl && supabaseUrl !== 'your_supabase_url_here' ? supabaseUrl : 'https://placeholder.supabase.co';
  const validKey = supabaseKey && supabaseKey !== 'your_supabase_anon_key_here' ? supabaseKey : 'placeholder-key';

  return createServerClient(validUrl, validKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  );
}
