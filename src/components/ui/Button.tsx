import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus-ring cursor-pointer select-none';

  const variants: Record<string, string> = {
    primary: 'gradient-primary text-white hover:opacity-90 hover:shadow-lg hover:shadow-primary-500/25 active:scale-[0.98]',
    secondary: 'bg-surface-800 text-surface-100 hover:bg-surface-700 border border-surface-700 active:scale-[0.98]',
    danger: 'bg-danger-600 text-white hover:bg-danger-500 active:scale-[0.98]',
    ghost: 'text-surface-300 hover:text-surface-100 hover:bg-surface-800/50',
    outline: 'border border-surface-600 text-surface-300 hover:border-primary-500 hover:text-primary-400 hover:bg-primary-500/5',
  };

  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
        disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}
