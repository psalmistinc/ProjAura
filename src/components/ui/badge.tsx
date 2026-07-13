import { cn } from '@/lib/utils/cn';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'outline';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  pulse?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-aura-steel/30 text-text-secondary border-surface-border',
  success: 'bg-aura-teal/20 text-aura-teal border-aura-teal/30',
  warning: 'bg-aura-amber/20 text-aura-amber border-aura-amber/30',
  danger: 'bg-aura-red/20 text-aura-red border-aura-red/30',
  info: 'bg-aura-blue/20 text-aura-blue border-aura-blue/30',
  purple: 'bg-aura-purple/20 text-aura-purple border-aura-purple/30',
  outline: 'bg-transparent text-text-secondary border-surface-border',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export function Badge({ children, variant = 'default', size = 'md', className, pulse }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={cn(
            'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
            variant === 'success' && 'bg-aura-teal',
            variant === 'warning' && 'bg-aura-amber',
            variant === 'danger' && 'bg-aura-red',
            variant === 'info' && 'bg-aura-blue',
          )} />
          <span className={cn(
            'relative inline-flex rounded-full h-2 w-2',
            variant === 'success' && 'bg-aura-teal',
            variant === 'warning' && 'bg-aura-amber',
            variant === 'danger' && 'bg-aura-red',
            variant === 'info' && 'bg-aura-blue',
          )} />
        </span>
      )}
      {children}
    </span>
  );
}
