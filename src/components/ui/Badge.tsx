// ============================================================
// AttendX — Badge Component
// ============================================================

'use client';

import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export default function Badge({ variant = 'default', children, className, dot }: BadgeProps) {
  const variants = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
    default: 'bg-ios-gray-5 text-foreground',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
        variants[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full', {
            'bg-ios-green': variant === 'success',
            'bg-ios-orange': variant === 'warning',
            'bg-ios-red': variant === 'danger',
            'bg-ios-blue': variant === 'info',
            'bg-ios-gray': variant === 'default',
          })}
        />
      )}
      {children}
    </span>
  );
}
