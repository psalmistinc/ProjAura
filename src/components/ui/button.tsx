'use client';

import { forwardRef } from 'react';
import { motion, type MotionProps } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline' | 'glow';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends Omit<MotionProps, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-aura-blue to-aura-cyan text-white hover:shadow-glow-blue',
  secondary: 'bg-aura-steel/50 text-text-primary hover:bg-aura-steel border border-surface-border',
  ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/5',
  danger: 'bg-aura-red/20 text-aura-red hover:bg-aura-red/30 border border-aura-red/30',
  success: 'bg-aura-teal/20 text-aura-teal hover:bg-aura-teal/30 border border-aura-teal/30',
  outline: 'bg-transparent text-text-primary border border-surface-border hover:border-aura-blue hover:text-aura-blue',
  glow: 'bg-aura-blue/20 text-aura-blue border border-aura-blue/30 hover:shadow-glow-blue hover:bg-aura-blue/30',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-md gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-6 py-3 text-base rounded-lg gap-2',
  xl: 'px-8 py-4 text-lg rounded-xl gap-3',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, disabled, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={disabled ? undefined : { scale: 1.02 }}
        whileTap={disabled ? undefined : { scale: 0.98 }}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-300 cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-aura-blue/50 focus:ring-offset-2 focus:ring-offset-aura-void',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
