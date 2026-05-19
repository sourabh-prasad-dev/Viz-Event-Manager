// ─── Event ──────────────────────────────────────────────
export interface Event {
  id: string;
  name: string;
  date: string;
  venue: string;
  description: string;
  sheetUrl: string;
  status: 'active' | 'completed' | 'draft';
  attendeeCount?: number;
  scannedCount?: number;
  createdAt: string;
}

// ─── Attendee ───────────────────────────────────────────
export interface Attendee {
  registrationId: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  eventId: string;
  qrToken: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  scanTime: string;
  addedOnSpot: boolean;
}

// ─── User / Auth ────────────────────────────────────────
export type UserRole = 'super_admin' | 'event_admin' | 'scanner';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assignedEvents: string[];
}

export interface AuthState {
  user: User | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
}

// ─── API ────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  sessionToken: string;
}

// ─── Analytics ──────────────────────────────────────────
export interface EventAnalytics {
  totalRegistered: number;
  totalCheckedIn: number;
  totalPending: number;
  totalOnSpot: number;
  hourlyScans: { hour: string; count: number }[];
  statusDistribution: { name: string; value: number }[];
}

// ─── QR Validation ──────────────────────────────────────
export interface QRValidationResult {
  valid: boolean;
  status: 'approved' | 'already_scanned' | 'invalid' | 'not_found';
  attendee?: Attendee;
  message: string;
}

// ─── Toast ──────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}
