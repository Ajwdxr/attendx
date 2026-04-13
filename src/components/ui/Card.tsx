// ============================================================
// AttendX — Card Component
// ============================================================

'use client';

import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient';
  hoverable?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

export default function Card({
  className,
  variant = 'default',
  hoverable = false,
  padding = 'md',
  children,
  ...props
}: CardProps) {
  const variants = {
    default: 'bg-card shadow-[var(--shadow-sm)] border border-border',
    glass: 'glass',
    gradient: 'bg-gradient-to-br from-ios-blue to-[#5856d6] text-white',
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={cn(
        'rounded-[var(--radius-ios-sm)] transition-all duration-200',
        variants[variant],
        paddings[padding],
        hoverable && 'hover:shadow-[var(--shadow-md)] hover:scale-[1.01] cursor-pointer active:scale-[0.99]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
