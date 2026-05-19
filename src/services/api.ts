import type {
  ApiResponse,
  Attendee,
  Event,
  EventAnalytics,
  LoginResponse,
  QRValidationResult,
  User,
} from '@/types';

const GAS_URL = import.meta.env.VITE_GAS_URL || '';
const API_KEY = import.meta.env.VITE_API_KEY || '';

// ─── Core fetch wrapper ─────────────────────────────────
// Uses text/plain to avoid CORS preflight with Google Apps Script
async function apiPost<T>(action: string, payload: Record<string, unknown> = {}): Promise<ApiResponse<T>> {
  const sessionToken = localStorage.getItem('sessionToken') || '';

  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      redirect: 'follow',
      body: JSON.stringify({
        action,
        apiKey: API_KEY,
        sessionToken,
        ...payload,
      }),
    });

    const text = await response.text();
    return JSON.parse(text) as ApiResponse<T>;
  } catch (error) {
    console.error(`API Error [${action}]:`, error);
    return { status: 'error', message: 'Network error. Please check your connection.' };
  }
}

async function apiGet<T>(action: string, params: Record<string, string> = {}): Promise<ApiResponse<T>> {
  const sessionToken = localStorage.getItem('sessionToken') || '';
  const queryParams = new URLSearchParams({
    action,
    apiKey: API_KEY,
    sessionToken,
    ...params,
  });

  try {
    const response = await fetch(`${GAS_URL}?${queryParams.toString()}`, {
      method: 'GET',
      redirect: 'follow',
    });

    const text = await response.text();
    return JSON.parse(text) as ApiResponse<T>;
  } catch (error) {
    console.error(`API Error [${action}]:`, error);
    return { status: 'error', message: 'Network error. Please check your connection.' };
  }
}

// ─── Auth ────────────────────────────────────────────────
export async function loginApi(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
  return apiPost<LoginResponse>('login', { email, password });
}

export async function checkSession(): Promise<ApiResponse<{ user: User }>> {
  return apiGet<{ user: User }>('check_session');
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<void>> {
  return apiPost<void>('change_password', { oldPassword, newPassword });
}

// ─── Events ─────────────────────────────────────────────
export async function getEvents(): Promise<ApiResponse<Event[]>> {
  return apiGet<Event[]>('get_events');
}

export async function createEvent(event: Omit<Event, 'id' | 'createdAt' | 'attendeeCount' | 'scannedCount'>): Promise<ApiResponse<Event>> {
  return apiPost<Event>('create_event', { event });
}

export async function updateEvent(event: Partial<Event> & { id: string }): Promise<ApiResponse<Event>> {
  return apiPost<Event>('update_event', { event });
}

export async function deleteEvent(eventId: string): Promise<ApiResponse<void>> {
  return apiPost<void>('delete_event', { eventId });
}

// ─── Attendees ──────────────────────────────────────────
export async function getAttendees(eventId: string): Promise<ApiResponse<Attendee[]>> {
  return apiGet<Attendee[]>('get_attendees', { eventId });
}

export async function syncAttendees(eventId: string, sheetUrl: string): Promise<ApiResponse<Attendee[]>> {
  return apiPost<Attendee[]>('sync_attendees', { eventId, sheetUrl });
}

export async function generateTokens(eventId: string): Promise<ApiResponse<Attendee[]>> {
  return apiPost<Attendee[]>('generate_tokens', { eventId });
}

export async function addOnSpotRegistration(
  eventId: string,
  attendee: Omit<Attendee, 'registrationId' | 'qrToken' | 'status' | 'scanTime' | 'addedOnSpot' | 'eventId'>
): Promise<ApiResponse<Attendee>> {
  return apiPost<Attendee>('add_onspot', { eventId, attendee });
}

// ─── QR Validation ──────────────────────────────────────
export async function validateQR(token: string, eventId: string): Promise<ApiResponse<QRValidationResult>> {
  return apiPost<QRValidationResult>('validate_qr', { token, eventId });
}

// ─── Analytics ──────────────────────────────────────────
export async function getAnalytics(eventId?: string): Promise<ApiResponse<EventAnalytics>> {
  return apiGet<EventAnalytics>('get_analytics', eventId ? { eventId } : {});
}

// ─── Users ──────────────────────────────────────────────
export async function getUsers(): Promise<ApiResponse<User[]>> {
  return apiGet<User[]>('get_users');
}

export async function createUser(user: Omit<User, 'id'> & { password: string }): Promise<ApiResponse<User>> {
  return apiPost<User>('create_user', { user });
}

export async function updateUser(user: Partial<User> & { id: string }): Promise<ApiResponse<User>> {
  return apiPost<User>('update_user', { user });
}

export async function deleteUser(userId: string): Promise<ApiResponse<void>> {
  return apiPost<void>('delete_user', { userId });
}

// ─── Export ─────────────────────────────────────────────
export async function exportAttendees(eventId: string): Promise<ApiResponse<Attendee[]>> {
  return apiGet<Attendee[]>('export_attendees', { eventId });
}
