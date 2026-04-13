// ============================================================
// AttendX — Attendance Store (Zustand)
// ============================================================

import { create } from 'zustand';
import type { Attendance, AttendanceType, CheckInMethod, DashboardStats } from '@/types';
import { createClient } from '@/lib/supabase/client';

interface AttendanceState {
  records: Attendance[];
  isLoading: boolean;
  stats: DashboardStats | null;

  // Actions
  fetchRecords: (userId: string) => Promise<void>;
  fetchStats: (userId: string) => Promise<void>;
  submitCheckIn: (data: {
    userId: string;
    type: AttendanceType;
    method: CheckInMethod;
    latitude?: number;
    longitude?: number;
    locationId?: string;
    faceMatchScore?: number;
    notes?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  fetchAllRecords: () => Promise<void>;
  updateStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  records: [],
  isLoading: false,
  stats: null,

  fetchRecords: async (userId) => {
    set({ isLoading: true });
    const supabase = createClient();

    const { data, error } = await supabase
      .from('attendance')
      .select('*, location:locations(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      set({ records: data as Attendance[], isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  fetchStats: async (userId) => {
    const supabase = createClient();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfMonthISO = startOfMonth.toISOString();

    // Today's records
    const { data: todayRecords } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', todayISO)
      .order('created_at', { ascending: false });

    // This month's unique days
    const { data: monthRecords } = await supabase
      .from('attendance')
      .select('created_at')
      .eq('user_id', userId)
      .eq('type', 'check_in')
      .gte('created_at', startOfMonthISO);

    // All time records for streak
    const { data: allRecords } = await supabase
      .from('attendance')
      .select('created_at')
      .eq('user_id', userId)
      .eq('type', 'check_in')
      .order('created_at', { ascending: false });

    // Calculate streak
    let streak = 0;
    if (allRecords && allRecords.length > 0) {
      const dates = [...new Set(
        allRecords.map((r) => new Date(r.created_at).toDateString())
      )];
      const checkDate = new Date();
      for (const dateStr of dates) {
        if (new Date(dateStr).toDateString() === checkDate.toDateString()) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Unique days this month
    const uniqueDays = new Set(
      monthRecords?.map((r) => new Date(r.created_at).toDateString())
    );

    // Determine today's status
    let todayStatus: DashboardStats['todayStatus'] = 'not_checked_in';
    if (todayRecords && todayRecords.length > 0) {
      const lastRecord = todayRecords[0];
      todayStatus = lastRecord.type === 'check_in' ? 'checked_in' : 'checked_out';
    }

    set({
      stats: {
        todayStatus,
        totalDays: allRecords?.length
          ? new Set(allRecords.map((r) => new Date(r.created_at).toDateString())).size
          : 0,
        currentStreak: streak,
        thisMonthDays: uniqueDays.size,
        lastCheckIn: todayRecords?.[0] as Attendance | undefined,
      },
    });
  },

  submitCheckIn: async (data) => {
    const supabase = createClient();

    const { error } = await supabase.from('attendance').insert({
      user_id: data.userId,
      type: data.type,
      method: data.method,
      latitude: data.latitude,
      longitude: data.longitude,
      location_id: data.locationId,
      face_match_score: data.faceMatchScore,
      notes: data.notes,
      status: 'approved', // Auto-approve for now
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Refresh records & stats
    await get().fetchRecords(data.userId);
    await get().fetchStats(data.userId);

    return { success: true };
  },

  fetchAllRecords: async () => {
    set({ isLoading: true });
    const supabase = createClient();

    const { data, error } = await supabase
      .from('attendance')
      .select('*, user:profiles(*), location:locations(*)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data) {
      set({ records: data as Attendance[], isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  updateStatus: async (id, status) => {
    const supabase = createClient();
    await supabase.from('attendance').update({ status }).eq('id', id);
    
    // Refresh
    const records = get().records.map((r) =>
      r.id === id ? { ...r, status } : r
    );
    set({ records });
  },
}));
