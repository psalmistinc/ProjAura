'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, type, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {icon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              'w-full rounded-lg border bg-aura-navy/30 px-4 py-2.5 text-sm text-text-primary',
              'placeholder:text-text-muted',
              'border-surface-border focus:border-aura-blue focus:ring-1 focus:ring-aura-blue/50',
              'outline-none transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              icon && 'pl-10',
              error && 'border-aura-red focus:border-aura-red focus:ring-aura-red/50',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-aura-red">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
