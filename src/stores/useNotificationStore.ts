// ============================================================
// AttendX — Notification Store (Zustand)
// ============================================================

import { create } from 'zustand';
import type { Notification } from '@/types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;

  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      read: false,
      created_at: new Date().toISOString(),
    };

    const notifications = [newNotification, ...get().notifications].slice(0, 50);
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    });
  },

  markAsRead: (id) => {
    const notifications = get().notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    });
  },

  markAllAsRead: () => {
    const notifications = get().notifications.map((n) => ({ ...n, read: true }));
    set({ notifications, unreadCount: 0 });
  },

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));
