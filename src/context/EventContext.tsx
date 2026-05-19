import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Event, Attendee } from '@/types';
import { generateId } from '@/utils/helpers';
import * as api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

// ─── Demo Data ──────────────────────────────────────────
const DEMO_EVENTS: Event[] = [
  {
    id: 'evt_001',
    name: 'Tech Summit 2026',
    date: '2026-06-15',
    venue: 'Convention Center, Bangalore',
    description: 'Annual technology conference featuring industry leaders and innovators.',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/demo1',
    status: 'active',
    attendeeCount: 342,
    scannedCount: 187,
    createdAt: '2026-05-01T10:00:00Z',
  },
  {
    id: 'evt_002',
    name: 'Design Workshop',
    date: '2026-07-20',
    venue: 'Creative Hub, Mumbai',
    description: 'Hands-on workshop on modern UI/UX design principles.',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/demo2',
    status: 'active',
    attendeeCount: 85,
    scannedCount: 0,
    createdAt: '2026-05-10T14:00:00Z',
  },
  {
    id: 'evt_003',
    name: 'Startup Pitch Day',
    date: '2026-05-01',
    venue: 'Innovation Park, Delhi',
    description: 'Startups pitch their ideas to top VCs and angel investors.',
    sheetUrl: 'https://docs.google.com/spreadsheets/d/demo3',
    status: 'completed',
    attendeeCount: 210,
    scannedCount: 195,
    createdAt: '2026-04-15T09:00:00Z',
  },
  {
    id: 'evt_004',
    name: 'AI & ML Conference',
    date: '2026-08-10',
    venue: 'Tech Park, Hyderabad',
    description: 'Exploring the latest in artificial intelligence and machine learning.',
    sheetUrl: '',
    status: 'draft',
    attendeeCount: 0,
    scannedCount: 0,
    createdAt: '2026-05-18T08:00:00Z',
  },
];

const DEMO_ATTENDEES: Attendee[] = [
  { registrationId: 'REG001', fullName: 'Aarav Sharma', email: 'aarav@example.com', phone: '+91-9876543210', company: 'TechCorp', eventId: 'evt_001', qrToken: 'EVT_evt001_tkn_a1b2c3d4', status: 'Approved', scanTime: '2026-06-15T09:15:00Z', addedOnSpot: false },
  { registrationId: 'REG002', fullName: 'Priya Patel', email: 'priya@example.com', phone: '+91-9876543211', company: 'DesignStudio', eventId: 'evt_001', qrToken: 'EVT_evt001_tkn_e5f6g7h8', status: 'Pending', scanTime: '', addedOnSpot: false },
  { registrationId: 'REG003', fullName: 'Rahul Verma', email: 'rahul@example.com', phone: '+91-9876543212', company: 'DataDriven', eventId: 'evt_001', qrToken: 'EVT_evt001_tkn_i9j0k1l2', status: 'Approved', scanTime: '2026-06-15T09:32:00Z', addedOnSpot: false },
  { registrationId: 'REG004', fullName: 'Sneha Gupta', email: 'sneha@example.com', phone: '+91-9876543213', company: 'CloudNine', eventId: 'evt_001', qrToken: 'EVT_evt001_tkn_m3n4o5p6', status: 'Pending', scanTime: '', addedOnSpot: false },
  { registrationId: 'REG005', fullName: 'Vikram Singh', email: 'vikram@example.com', phone: '+91-9876543214', company: 'InnovateTech', eventId: 'evt_001', qrToken: 'EVT_evt001_tkn_q7r8s9t0', status: 'Approved', scanTime: '2026-06-15T10:05:00Z', addedOnSpot: true },
  { registrationId: 'REG006', fullName: 'Anita Desai', email: 'anita@example.com', phone: '+91-9876543215', company: 'PixelPerfect', eventId: 'evt_001', qrToken: 'EVT_evt001_tkn_u1v2w3x4', status: 'Pending', scanTime: '', addedOnSpot: false },
  { registrationId: 'REG007', fullName: 'Karthik Nair', email: 'karthik@example.com', phone: '+91-9876543216', company: 'ByteForce', eventId: 'evt_001', qrToken: 'EVT_evt001_tkn_y5z6a7b8', status: 'Approved', scanTime: '2026-06-15T09:48:00Z', addedOnSpot: false },
  { registrationId: 'REG008', fullName: 'Meera Joshi', email: 'meera@example.com', phone: '+91-9876543217', company: 'StartupHub', eventId: 'evt_002', qrToken: 'EVT_evt002_tkn_c9d0e1f2', status: 'Pending', scanTime: '', addedOnSpot: false },
  { registrationId: 'REG009', fullName: 'Arjun Reddy', email: 'arjun@example.com', phone: '+91-9876543218', company: 'ScaleUp', eventId: 'evt_002', qrToken: 'EVT_evt002_tkn_g3h4i5j6', status: 'Pending', scanTime: '', addedOnSpot: false },
  { registrationId: 'REG010', fullName: 'Divya Krishnan', email: 'divya@example.com', phone: '+91-9876543219', company: 'FutureWorks', eventId: 'evt_003', qrToken: 'EVT_evt003_tkn_k7l8m9n0', status: 'Approved', scanTime: '2026-05-01T11:20:00Z', addedOnSpot: false },
];

// ─── Context ────────────────────────────────────────────
interface EventContextValue {
  events: Event[];
  attendees: Attendee[];
  selectedEvent: Event | null;
  setSelectedEvent: (event: Event | null) => void;
  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'attendeeCount' | 'scannedCount'>) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (eventId: string) => void;
  getEventAttendees: (eventId: string) => Attendee[];
  addAttendee: (attendee: Attendee) => void;
  updateAttendeeStatus: (registrationId: string, status: 'Approved' | 'Pending' | 'Rejected', scanTime?: string) => void;
  refreshData: () => void;
  loading: boolean;
}

const EventContext = createContext<EventContextValue | null>(null);

export function useEvents(): EventContextValue {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error('useEvents must be used within EventProvider');
  return ctx;
}

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const isApiConfigured = import.meta.env.VITE_GAS_URL && import.meta.env.VITE_GAS_URL !== 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

  const normalizeEvent = (raw: any): Event => ({
    id: raw.id || raw.EventId || '',
    name: raw.name || raw.Name || '',
    date: raw.date || raw.Date || '',
    venue: raw.venue || raw.Venue || '',
    description: raw.description || raw.Description || '',
    sheetUrl: raw.sheetUrl || raw.SheetUrl || '',
    status: raw.status || raw.Status || 'draft',
    attendeeCount: raw.attendeeCount || raw.AttendeeCount || 0,
    scannedCount: raw.scannedCount || raw.ScannedCount || 0,
    createdAt: raw.createdAt || raw.CreatedAt || new Date().toISOString(),
  });

  const refreshData = useCallback(async () => {
    setLoading(true);
    if (isApiConfigured) {
      try {
        const eventsRes = await api.getEvents();
        if (eventsRes.status === 'success' && eventsRes.data) {
          const normalizedEvents = eventsRes.data.map(normalizeEvent);
          setEvents(normalizedEvents);
          // If we have events, fetch attendees for all of them
          // In a real large-scale app, you'd fetch per-event or paginate
          const allAttendees: Attendee[] = [];
          for (const ev of normalizedEvents) {
             const attRes = await api.getAttendees(ev.id);
             if (attRes.status === 'success' && attRes.data) {
                allAttendees.push(...attRes.data);
             }
          }
          setAttendees(allAttendees);
        }
      } catch (error) {
        console.error('Failed to fetch from API', error);
      }
    } else {
      setEvents(DEMO_EVENTS);
      setAttendees(DEMO_ATTENDEES);
    }
    setLoading(false);
  }, [isApiConfigured]);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated, refreshData]);

  const addEvent = useCallback(async (eventData: Omit<Event, 'id' | 'createdAt' | 'attendeeCount' | 'scannedCount'>) => {
    if (isApiConfigured) {
      const res = await api.createEvent(eventData);
      if (res.status === 'success' && res.data) {
        setEvents((prev) => [res.data!, ...prev]);
      }
    } else {
      const newEvent: Event = {
        ...eventData,
        id: 'evt_' + generateId(),
        createdAt: new Date().toISOString(),
        attendeeCount: 0,
        scannedCount: 0,
      };
      setEvents((prev) => [newEvent, ...prev]);
    }
  }, [isApiConfigured]);


  const updateEventFn = useCallback(async (updatedEvent: Event) => {
    if (isApiConfigured) {
      const res = await api.updateEvent(updatedEvent);
      if (res.status === 'success' && res.data) {
        setEvents((prev) => prev.map((e) => (e.id === updatedEvent.id ? res.data! : e)));
      }
    } else {
      setEvents((prev) => prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)));
    }
  }, [isApiConfigured]);

  const deleteEventFn = useCallback(async (eventId: string) => {
    if (isApiConfigured) {
      const res = await api.deleteEvent(eventId);
      if (res.status === 'success') {
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
        setAttendees((prev) => prev.filter((a) => a.eventId !== eventId));
      }
    } else {
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      setAttendees((prev) => prev.filter((a) => a.eventId !== eventId));
    }
  }, [isApiConfigured]);

  const getEventAttendees = useCallback(
    (eventId: string) => attendees.filter((a) => a.eventId === eventId),
    [attendees]
  );

  const addAttendee = useCallback(async (attendeeData: Attendee) => {
    if (isApiConfigured) {
       // Omit frontend-only fields for API
       const { registrationId, qrToken, status, scanTime, addedOnSpot, eventId, ...rest } = attendeeData;
       const res = await api.addOnSpotRegistration(eventId, rest);
       if (res.status === 'success' && res.data) {
         setAttendees((prev) => [...prev, res.data!]);
         setEvents((prev) =>
           prev.map((e) =>
             e.id === eventId
               ? { ...e, attendeeCount: (e.attendeeCount || 0) + 1 }
               : e
           )
         );
       }
    } else {
      setAttendees((prev) => [...prev, attendeeData]);
      setEvents((prev) =>
        prev.map((e) =>
          e.id === attendeeData.eventId
            ? { ...e, attendeeCount: (e.attendeeCount || 0) + 1 }
            : e
        )
      );
    }
  }, [isApiConfigured]);

  const updateAttendeeStatus = useCallback(
    async (registrationId: string, status: 'Approved' | 'Pending' | 'Rejected', scanTime?: string) => {
      // For API, this is usually handled by validateQR. We will update local state optimistically.
      setAttendees((prev) =>
        prev.map((a) =>
          a.registrationId === registrationId
            ? { ...a, status, scanTime: scanTime || a.scanTime }
            : a
        )
      );
    },
    []
  );

  // refreshData is now defined above

  return (
    <EventContext.Provider
      value={{
        events,
        attendees,
        selectedEvent,
        setSelectedEvent,
        addEvent,
        updateEvent: updateEventFn,
        deleteEvent: deleteEventFn,
        getEventAttendees,
        addAttendee,
        updateAttendeeStatus,
        refreshData,
        loading,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}
