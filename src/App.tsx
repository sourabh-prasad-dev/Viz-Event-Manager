import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { EventProvider } from '@/context/EventContext';
import { ToastContainer } from '@/components/ui/Toast';
import { router } from '@/routes';

function App() {
  return (
    <AuthProvider>
      <EventProvider>
        <RouterProvider router={router} />
        <ToastContainer />
      </EventProvider>
    </AuthProvider>
  );
}

export default App;
