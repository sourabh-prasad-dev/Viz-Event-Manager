import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/ui/Sidebar';
import { Header } from '@/components/ui/Header';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const sidebarWidth = sidebarCollapsed ? 72 : 280;

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Mobile overlay */}
      {mobileMenuOpen && !isDesktop && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - sliding drawer on mobile, fixed on desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out ${
          isDesktop
            ? 'translate-x-0'
            : mobileMenuOpen
              ? 'translate-x-0'
              : '-translate-x-full'
        }`}
      >
        <Sidebar
          collapsed={isDesktop ? sidebarCollapsed : false}
          onToggle={() => {
            if (isDesktop) {
              setSidebarCollapsed(!sidebarCollapsed);
            } else {
              setMobileMenuOpen(false);
            }
          }}
        />
      </div>

      {/* Main content */}
      <div
        style={{ marginLeft: isDesktop ? `${sidebarWidth}px` : 0 }}
        className="transition-all duration-300 min-h-screen flex flex-col"
      >
        <Header onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="flex-1 dashboard-main-content">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
