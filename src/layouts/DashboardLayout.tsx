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

      {/* Sidebar - hidden on mobile unless toggled */}
      <div className={`${isDesktop ? 'block' : mobileMenuOpen ? 'block' : 'hidden'}`}>
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
        <main className="flex-1 px-8 py-8 lg:px-10 lg:py-8">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
