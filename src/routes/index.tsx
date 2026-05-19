import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Events } from '@/pages/Events';
import { EventDetail } from '@/pages/EventDetail';
import { Attendees } from '@/pages/Attendees';
import { QRGenerator } from '@/pages/QRGenerator';
import { Scanner } from '@/pages/Scanner';
import { Reports } from '@/pages/Reports';
import { Settings } from '@/pages/Settings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <Login /> },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      {
        path: '/events',
        element: (
          <ProtectedRoute allowedRoles={['super_admin', 'event_admin']}>
            <Events />
          </ProtectedRoute>
        ),
      },
      {
        path: '/events/:id',
        element: (
          <ProtectedRoute allowedRoles={['super_admin', 'event_admin']}>
            <EventDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: '/attendees',
        element: (
          <ProtectedRoute allowedRoles={['super_admin', 'event_admin']}>
            <Attendees />
          </ProtectedRoute>
        ),
      },
      {
        path: '/qr-generator',
        element: (
          <ProtectedRoute allowedRoles={['super_admin', 'event_admin']}>
            <QRGenerator />
          </ProtectedRoute>
        ),
      },
      { path: '/scanner', element: <Scanner /> },
      {
        path: '/reports',
        element: (
          <ProtectedRoute allowedRoles={['super_admin', 'event_admin']}>
            <Reports />
          </ProtectedRoute>
        ),
      },
      {
        path: '/settings',
        element: (
          <ProtectedRoute allowedRoles={['super_admin']}>
            <Settings />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
