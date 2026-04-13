// ============================================================
// AttendX — Auth Store (Zustand)
// ============================================================

import { create } from 'zustand';
import type { User } from '@/types';
import { createClient } from '@/lib/supabase/client';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;

  // Actions
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isInitialized: false,

  setUser: (user) =>
    set({ user, isAuthenticated: !!user, isLoading: false, isInitialized: true }),

  fetchUser: async () => {
    // Avoid concurrent fetches
    if ((globalThis as any).__isFetchingUser) return;
    (globalThis as any).__isFetchingUser = true;

    try {
      set({ isLoading: true });
      const supabase = createClient();
      
      const { data, error: authError } = await supabase.auth.getUser();

      if (authError || !data || !data.user) {
        set({ user: null, isAuthenticated: false });
        return;
      }

      const authUser = data.user;
      
      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        // PGRST116 means no rows found
        if (profileError.code === 'PGRST116') {
          console.log('[AuthStore] Profile not found, creating one...');
          const newProfile = {
            id: authUser.id,
            email: authUser.email!,
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
            avatar_url: authUser.user_metadata?.avatar_url || null,
            role: 'employee' as const,
          };

          const { error: insertError } = await supabase.from('profiles').insert(newProfile);
          
          if (insertError) {
            console.error('[AuthStore] Error inserting profile:', insertError.message);
          }

          set({
            user: {
              ...newProfile,
              face_descriptor: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            isAuthenticated: true,
          });
        } else {
          console.error('[AuthStore] Unexpected profile fetch error:', profileError.message);
          // Don't overwrite if it's a server error
          set({
            user: {
              id: authUser.id,
              email: authUser.email!,
              name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
              role: 'employee', // Fallback
              created_at: authUser.created_at,
              updated_at: authUser.created_at,
            },
            isAuthenticated: true,
          });
        }
      } else if (profile) {
        set({
          user: {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            avatar_url: profile.avatar_url,
            role: profile.role,
            face_descriptor: profile.face_descriptor,
            created_at: profile.created_at,
            updated_at: profile.updated_at,
          },
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error('[AuthStore] Auth check failed:', error);
      set({ user: null, isAuthenticated: false });
    } finally {
      (globalThis as any).__isFetchingUser = false;
      set({ isLoading: false, isInitialized: true });
    }
  },

  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: async (data) => {
    const supabase = createClient();
    const user = get().user;
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (!error) {
      set({ user: { ...user, ...data } });
    }
  },
}));
