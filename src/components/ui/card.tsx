'use client';

import { motion, type MotionProps } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface CardProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'glass' | 'solid' | 'gradient' | 'glow';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantStyles = {
  glass: 'glass',
  solid: 'bg-aura-navy/50 border border-surface-border',
  gradient: 'bg-gradient-to-br from-aura-navy/60 to-aura-deep/60 border border-surface-border',
  glow: 'glass animate-pulse-glow',
};

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  children,
  className,
  variant = 'glass',
  hover = true,
  padding = 'md',
  ...props
}: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { 
        scale: 1.01, 
        y: -2,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 40px rgba(59,130,246,0.1)',
      } : undefined}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'rounded-xl border transition-all duration-300',
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-lg font-semibold text-text-primary', className)}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('', className)}>{children}</div>;
}
