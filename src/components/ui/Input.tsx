import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex-col-gap-2">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-surface-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500 z-10">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full bg-surface-800/80 border border-surface-700 rounded-xl py-2.5 text-sm text-surface-100 placeholder:text-surface-500 transition-all duration-200 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 hover:border-surface-600 ${
              icon ? 'force-pl-10' : 'force-px-4'
            } ${rightIcon ? 'force-pr-10' : 'force-px-4'} ${
              error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : ''
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-500 z-10">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-danger-400 mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
