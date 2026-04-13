// ============================================================
// AttendX — Bottom Navigation Bar
// ============================================================

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LayoutDashboard, ScanFace, Clock, UserCircle } from 'lucide-react';

const tabs = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/check-in', icon: ScanFace, label: 'Check In' },
  { href: '/history', icon: Clock, label: 'History' },
  { href: '/profile', icon: UserCircle, label: 'Profile' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around h-[52px]">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 w-16 py-1',
                'transition-all duration-200 rounded-xl',
                'active:scale-90 transform-gpu',
                isActive ? 'text-ios-blue' : 'text-muted'
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'w-6 h-6 transition-all duration-200',
                    isActive && 'scale-110'
                  )}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                {isActive && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-ios-blue" />
                )}
              </div>
              <span className={cn(
                'text-[10px] font-medium transition-all duration-200',
                isActive && 'font-semibold'
              )}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
