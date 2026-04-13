// ============================================================
// AttendX — Auth Provider
// ============================================================

'use client';

import { useEffect } from 'react';
import { AuthChangeEvent } from '@supabase/supabase-js';
import { useAuthStore } from '@/stores/useAuthStore';
import { createClient } from '@/lib/supabase/client';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    fetchUser();

    // Listen for auth state changes
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'SIGNED_IN') {
          // fetchUser handles its own concurrency now
          fetchUser();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchUser, setUser]);

  return <>{children}</>;
}
