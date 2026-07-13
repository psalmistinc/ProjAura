import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'shimmer' | 'pulse';
}

export function Skeleton({ className, variant = 'shimmer' }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-aura-steel/20',
        variant === 'shimmer' && 'animate-shimmer',
        variant === 'pulse' && 'animate-pulse',
        className
      )}
    />
  );
}
