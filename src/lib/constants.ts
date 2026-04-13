// ============================================================
// AttendX — App Constants
// ============================================================

export const APP_NAME = 'AttendX';
export const APP_DESCRIPTION = 'Smart attendance tracking with face recognition & location check-in';

// Default check-in radius in meters
export const DEFAULT_RADIUS = 100;

// Face recognition confidence threshold (0 to 1, lower = stricter)
export const FACE_MATCH_THRESHOLD = 0.6;

// Geolocation options
export const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  CHECK_IN: '/check-in',
  HISTORY: '/history',
  PROFILE: '/profile',
  ADMIN: '/admin',
  ADMIN_LOCATIONS: '/admin/locations',
} as const;

// Protected routes that require authentication
export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.CHECK_IN,
  ROUTES.HISTORY,
  ROUTES.PROFILE,
  ROUTES.ADMIN,
  ROUTES.ADMIN_LOCATIONS,
];

// Public routes (no auth needed)
export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
];
