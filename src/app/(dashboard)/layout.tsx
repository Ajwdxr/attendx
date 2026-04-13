// ============================================================
// AttendX — Dashboard Layout
// ============================================================

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import BottomNav from '@/components/ui/BottomNav';
import { PageLoader } from '@/components/ui/Spinner';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-ios-orange text-white text-center py-2 text-xs font-semibold flex items-center justify-center gap-1.5 animate-slide-down safe-area-top">
          <WifiOff className="w-3.5 h-3.5" />
          You&apos;re offline — changes will sync when connected
        </div>
      )}

      {/* Main content */}
      <main className="pb-20 max-w-lg mx-auto">
        {children}
      </main>

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  );
}
