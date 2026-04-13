// ============================================================
// AttendX — Location Store (Zustand)
// ============================================================

import { create } from 'zustand';
import type { Location } from '@/types';
import { createClient } from '@/lib/supabase/client';

interface LocationState {
  locations: Location[];
  isLoading: boolean;

  // Actions
  fetchLocations: () => Promise<void>;
  createLocation: (data: Omit<Location, 'id' | 'created_at'>) => Promise<{ success: boolean; error?: string }>;
  updateLocation: (id: string, data: Partial<Location>) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  locations: [],
  isLoading: false,

  fetchLocations: async () => {
    set({ isLoading: true });
    const supabase = createClient();

    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (!error && data) {
      set({ locations: data as Location[], isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  createLocation: async (data) => {
    const supabase = createClient();
    const { error } = await supabase.from('locations').insert(data);
    if (error) return { success: false, error: error.message };
    
    await get().fetchLocations();
    return { success: true };
  },

  updateLocation: async (id, data) => {
    const supabase = createClient();
    await supabase.from('locations').update(data).eq('id', id);
    await get().fetchLocations();
  },

  deleteLocation: async (id) => {
    const supabase = createClient();
    await supabase.from('locations').update({ is_active: false }).eq('id', id);
    await get().fetchLocations();
  },
}));
