import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  QrCode,
  ScanLine,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['super_admin', 'event_admin', 'scanner'] },
  { path: '/events', label: 'Events', icon: <Calendar className="w-5 h-5" />, roles: ['super_admin', 'event_admin'] },
  { path: '/attendees', label: 'Attendees', icon: <Users className="w-5 h-5" />, roles: ['super_admin', 'event_admin'] },
  { path: '/qr-generator', label: 'QR Generator', icon: <QrCode className="w-5 h-5" />, roles: ['super_admin', 'event_admin'] },
  { path: '/scanner', label: 'Scanner', icon: <ScanLine className="w-5 h-5" />, roles: ['super_admin', 'event_admin', 'scanner'] },
  { path: '/reports', label: 'Reports', icon: <BarChart3 className="w-5 h-5" />, roles: ['super_admin', 'event_admin'] },
  { path: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" />, roles: ['super_admin'] },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const filteredItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? 'w-[72px]' : 'w-[280px]'
      }`}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-surface-900/95 backdrop-blur-xl border-r border-surface-800" />

      {/* Content */}
      <div className="relative flex flex-col h-full">
        {/* Logo */}
        <div className={`flex items-center gap-3 h-[72px] border-b border-surface-800/50 ${collapsed ? 'px-4 justify-center' : 'px-6'}`}>
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold gradient-text whitespace-nowrap">
              VizEvent
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 py-5 space-y-1.5 overflow-y-auto ${collapsed ? 'px-2' : 'px-4'}`}>
          {filteredItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'gradient-primary text-white shadow-lg shadow-primary-500/20'
                    : 'text-surface-400 hover:text-surface-100 hover:bg-surface-800/60'
                } ${collapsed ? 'justify-center px-0' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className={`border-t border-surface-800/50 space-y-2 ${collapsed ? 'p-2 pb-4' : 'p-4 pb-5'}`}>
          {!collapsed && user && (
            <div className="px-3.5 py-3 rounded-xl bg-surface-800/40">
              <p className="text-sm font-medium text-surface-200 truncate">{user.name}</p>
              <p className="text-xs text-surface-500 truncate mt-0.5">{user.role.replace('_', ' ')}</p>
            </div>
          )}
          <button
            onClick={logout}
            className={`flex items-center gap-3 w-full px-3.5 py-3 rounded-xl text-sm font-medium text-surface-400 hover:text-danger-400 hover:bg-danger-500/10 transition-all duration-200 cursor-pointer ${
              collapsed ? 'justify-center px-0' : ''
            }`}
            title="Logout"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="absolute -right-3.5 top-[76px] w-7 h-7 rounded-full bg-surface-800 border border-surface-700 flex items-center justify-center text-surface-400 hover:text-surface-200 hover:border-primary-500 transition-all duration-200 cursor-pointer shadow-md"
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </aside>
  );
}
