import { cn } from '@/lib/utils/cn';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}

const sizeStyles = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

export function Avatar({ src, alt, size = 'md', fallback, className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn('rounded-full object-cover', sizeStyles[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-aura-steel/50 flex items-center justify-center font-medium text-text-secondary',
        sizeStyles[size],
        className
      )}
    >
      {fallback || '?'}
    </div>
  );
}
