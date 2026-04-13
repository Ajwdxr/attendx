// ============================================================
// AttendX — Button Component
// ============================================================

'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, fullWidth, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-ios-blue text-white hover:bg-ios-blue/90 active:bg-ios-blue/80 shadow-[var(--shadow-sm)]',
      secondary: 'bg-ios-gray-5 text-foreground hover:bg-ios-gray-4 active:bg-ios-gray-3',
      danger: 'bg-ios-red text-white hover:bg-ios-red/90 active:bg-ios-red/80',
      ghost: 'bg-transparent text-ios-blue hover:bg-ios-blue/8 active:bg-ios-blue/12',
      outline: 'bg-transparent text-ios-blue border-2 border-ios-blue hover:bg-ios-blue/8',
    };

    const sizes = {
      sm: 'h-9 px-3.5 text-sm gap-1.5',
      md: 'h-11 px-5 text-[15px] gap-2',
      lg: 'h-[52px] px-6 text-[17px] gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-200',
          'rounded-[var(--radius-ios-lg)] select-none',
          'disabled:opacity-40 disabled:pointer-events-none',
          'active:scale-[0.97] transform-gpu',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          icon && <span className="shrink-0">{icon}</span>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
