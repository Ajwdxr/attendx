// ============================================================
// AttendX — Type Definitions
// ============================================================

export type Role = 'employee' | 'admin';
export type AttendanceType = 'check_in' | 'check_out';
export type CheckInMethod = 'face' | 'location' | 'manual' | 'combined';
export type AttendanceStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: Role;
  face_descriptor?: number[] | null;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  user_id: string;
  type: AttendanceType;
  method: CheckInMethod;
  latitude?: number;
  longitude?: number;
  location_id?: string;
  location?: Location;
  face_match_score?: number;
  status: AttendanceStatus;
  notes?: string;
  created_at: string;
  user?: User;
}

export interface Location {
  id: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  radius: number; // meters
  is_active: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  read: boolean;
  created_at: string;
}

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

export interface FaceDetectionState {
  isModelLoaded: boolean;
  isDetecting: boolean;
  matchScore: number | null;
  error: string | null;
}

export interface DashboardStats {
  todayStatus: 'checked_in' | 'checked_out' | 'not_checked_in';
  totalDays: number;
  currentStreak: number;
  thisMonthDays: number;
  lastCheckIn?: Attendance;
}
