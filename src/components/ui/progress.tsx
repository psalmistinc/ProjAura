'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  color?: 'blue' | 'cyan' | 'teal' | 'amber' | 'red';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const colorStyles = {
  blue: 'from-aura-blue to-aura-cyan',
  cyan: 'from-aura-cyan to-aura-teal',
  teal: 'from-aura-teal to-aura-emerald',
  amber: 'from-aura-amber to-aura-orange',
  red: 'from-aura-red to-aura-rose',
};

const sizeStyles = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export function Progress({ value, max = 100, className, color = 'blue', size = 'md', showLabel }: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-text-muted">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn('w-full rounded-full bg-aura-steel/20 overflow-hidden', sizeStyles[size])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          className={cn(
            'h-full rounded-full bg-gradient-to-r',
            colorStyles[color]
          )}
        />
      </div>
    </div>
  );
}
