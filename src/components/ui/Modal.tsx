// ============================================================
// AttendX — Modal Component
// ============================================================

'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Modal({ isOpen, onClose, title, children, className, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Content */}
      <div
        className={cn(
          'relative w-full bg-card rounded-t-[var(--radius-ios-xl)] sm:rounded-[var(--radius-ios-md)]',
          'shadow-[var(--shadow-xl)] animate-slide-up sm:animate-scale-in',
          sizes[size],
          className
        )}
      >
        {/* Handle bar (mobile) */}
        <div className="flex sm:hidden justify-center pt-2 pb-1">
          <div className="w-9 h-1 rounded-full bg-ios-gray-3" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 pt-3 pb-2">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-ios-gray-5 hover:bg-ios-gray-4 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-5 pb-6">{children}</div>
      </div>
    </div>
  );
}
