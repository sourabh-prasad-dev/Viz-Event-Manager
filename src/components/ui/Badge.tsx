import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'primary' | 'surface' | 'accent';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export function Badge({ children, variant = 'surface', size = 'sm', dot = false }: BadgeProps) {
  const variants: Record<string, string> = {
    success: 'bg-success-500/15 text-success-400 border-success-500/20',
    warning: 'bg-warning-500/15 text-warning-400 border-warning-500/20',
    danger: 'bg-danger-500/15 text-danger-400 border-danger-500/20',
    primary: 'bg-primary-500/15 text-primary-400 border-primary-500/20',
    surface: 'bg-surface-700/50 text-surface-400 border-surface-600/30',
    accent: 'bg-accent-500/15 text-accent-400 border-accent-500/20',
  };

  const sizes: Record<string, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  const dotColors: Record<string, string> = {
    success: 'bg-success-400',
    warning: 'bg-warning-400',
    danger: 'bg-danger-400',
    primary: 'bg-primary-400',
    surface: 'bg-surface-400',
    accent: 'bg-accent-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${variants[variant]} ${sizes[size]}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}
