import { cn } from '@/lib/utils/cn';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full border-collapse', className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className }: TableProps) {
  return (
    <thead className={cn('border-b border-surface-border', className)}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className }: TableProps) {
  return <tbody className={cn('', className)}>{children}</tbody>;
}

export function TableRow({ children, className }: TableProps) {
  return (
    <tr className={cn(
      'border-b border-surface-border/50 hover:bg-white/[0.02] transition-colors',
      className
    )}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className }: TableProps) {
  return (
    <th className={cn(
      'px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider',
      className
    )}>
      {children}
    </th>
  );
}

export function TableCell({ children, className }: TableProps) {
  return (
    <td className={cn('px-4 py-3 text-sm text-text-primary', className)}>
      {children}
    </td>
  );
}
