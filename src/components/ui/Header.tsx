import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/utils/helpers';

interface HeaderProps {
  onMenuClick: () => void;
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/events': 'Events',
  '/attendees': 'Attendees',
  '/qr-generator': 'QR Generator',
  '/scanner': 'Scanner',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const location = useLocation();

  const title = pageTitles[location.pathname] || 'VizEvent';

  return (
    <header className="h-[72px] flex items-center justify-between px-8 border-b border-surface-800/50 bg-surface-950/80 backdrop-blur-lg sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2.5 rounded-xl text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-surface-100">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-5">
        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full" />
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-surface-800" />

        {/* User Avatar */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-sm font-semibold text-white shadow-md shadow-primary-500/20">
              {getInitials(user.name)}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-surface-200">{user.name}</p>
              <p className="text-xs text-surface-500 capitalize">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
