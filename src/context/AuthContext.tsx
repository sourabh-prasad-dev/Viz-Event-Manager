import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User, AuthState, Toast as ToastType, ToastType as TType } from '@/types';
import { loginApi, checkSession } from '@/services/api';
import { generateId } from '@/utils/helpers';

// ─── Auth Context ───────────────────────────────────────
interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// ─── Toast Context ──────────────────────────────────────
interface ToastContextValue {
  toasts: ToastType[];
  addToast: (type: TType, title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within AuthProvider');
  return ctx;
}

// ─── Demo Data ──────────────────────────────────────────
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'admin@vizevent.com': {
    password: 'admin123',
    user: {
      id: 'usr_001',
      name: 'Saurabh Admin',
      email: 'admin@vizevent.com',
      role: 'super_admin',
      assignedEvents: [],
    },
  },
  'manager@vizevent.com': {
    password: 'manager123',
    user: {
      id: 'usr_002',
      name: 'Event Manager',
      email: 'manager@vizevent.com',
      role: 'event_admin',
      assignedEvents: ['evt_001', 'evt_002'],
    },
  },
  'scanner@vizevent.com': {
    password: 'scanner123',
    user: {
      id: 'usr_003',
      name: 'Gate Scanner',
      email: 'scanner@vizevent.com',
      role: 'scanner',
      assignedEvents: ['evt_001'],
    },
  },
};

// ─── Provider ───────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastType[]>([]);

  // Toast management
  const addToast = useCallback((type: TType, title: string, message?: string) => {
    const id = generateId();
    const toast: ToastType = { id, type, title, message, duration: 4000 };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), toast.duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Check existing session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('sessionToken');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as User;
        setUser(parsedUser);
        setSessionToken(savedToken);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true);

    // Try GAS API first, fall back to demo mode
    const gasUrl = import.meta.env.VITE_GAS_URL;
    if (gasUrl && gasUrl !== 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec') {
      const response = await loginApi(email, password);
      if (response.status === 'success' && response.data) {
        const { user: userData, sessionToken: token } = response.data;
        setUser(userData);
        setSessionToken(token);
        setIsAuthenticated(true);
        localStorage.setItem('sessionToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setLoading(false);
        return true;
      }
      setLoading(false);
      return false;
    }

    // Demo mode fallback
    const demoUser = DEMO_USERS[email.toLowerCase()];
    if (demoUser && demoUser.password === password) {
      const token = 'demo_' + generateId();
      setUser(demoUser.user);
      setSessionToken(token);
      setIsAuthenticated(true);
      localStorage.setItem('sessionToken', token);
      localStorage.setItem('user', JSON.stringify(demoUser.user));
      setLoading(false);
      return true;
    }

    setLoading(false);
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setSessionToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, sessionToken, isAuthenticated, login, logout, loading }}>
      <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
        {children}
      </ToastContext.Provider>
    </AuthContext.Provider>
  );
}
