// ============================================================
// AttendX — Dashboard Page
// ============================================================

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAttendanceStore } from '@/stores/useAttendanceStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import {
  ScanFace,
  MapPin,
  TrendingUp,
  Calendar,
  Clock,
  ChevronRight,
  Zap,
  LogIn,
  LogOut,
} from 'lucide-react';
import { getGreeting, formatTime, formatRelativeTime, getInitials } from '@/lib/utils';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { stats, records, fetchStats, fetchRecords, isLoading } = useAttendanceStore();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchStats(user.id);
      fetchRecords(user.id);
    }
  }, [user, fetchStats, fetchRecords]);

  if (!user) return <PageLoader />;

  const statusConfig = {
    checked_in: { label: 'Checked In', variant: 'success' as const, icon: LogIn },
    checked_out: { label: 'Checked Out', variant: 'default' as const, icon: LogOut },
    not_checked_in: { label: 'Not Checked In', variant: 'warning' as const, icon: Clock },
  };

  const currentStatus = statusConfig[stats?.todayStatus || 'not_checked_in'];

  return (
    <div className="p-5 space-y-5 stagger-children">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <p className="text-sm text-muted">{getGreeting()}</p>
          <h1 className="text-2xl font-bold tracking-tight">{user.name.split(' ')[0]}</h1>
        </div>
        <button
          onClick={() => router.push('/profile')}
          className="w-11 h-11 rounded-full bg-gradient-to-br from-ios-blue to-[#5856d6] flex items-center justify-center text-white font-bold text-sm shadow-[var(--shadow-md)] active:scale-95 transition-transform"
        >
          {getInitials(user.name)}
        </button>
      </div>

      {/* Status Card */}
      <Card variant="gradient" className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/70 text-sm">Today&apos;s Status</p>
              <div className="flex items-center gap-2 mt-1">
                <currentStatus.icon className="w-5 h-5" />
                <span className="text-lg font-semibold">{currentStatus.label}</span>
              </div>
            </div>
            <Badge variant={currentStatus.variant} dot>
              {stats?.todayStatus === 'checked_in' ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          {stats?.lastCheckIn && (
            <p className="text-white/60 text-xs">
              Last activity: {formatTime(stats.lastCheckIn.created_at)}
            </p>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          size="lg"
          fullWidth
          onClick={() => router.push('/check-in')}
          icon={<ScanFace className="w-5 h-5" />}
          className="!rounded-[var(--radius-ios-md)] !h-14"
        >
          Check In
        </Button>
        <Button
          size="lg"
          variant="secondary"
          fullWidth
          onClick={() => router.push('/check-in?type=out')}
          icon={<LogOut className="w-5 h-5" />}
          className="!rounded-[var(--radius-ios-md)] !h-14"
        >
          Check Out
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <div className="w-9 h-9 mx-auto mb-2 rounded-[10px] bg-ios-blue/10 flex items-center justify-center">
            <Zap className="w-4.5 h-4.5 text-ios-blue" />
          </div>
          <p className="text-xl font-bold">{stats?.currentStreak || 0}</p>
          <p className="text-xs text-muted mt-0.5">Day Streak</p>
        </Card>

        <Card className="text-center">
          <div className="w-9 h-9 mx-auto mb-2 rounded-[10px] bg-ios-green/10 flex items-center justify-center">
            <Calendar className="w-4.5 h-4.5 text-ios-green" />
          </div>
          <p className="text-xl font-bold">{stats?.thisMonthDays || 0}</p>
          <p className="text-xs text-muted mt-0.5">This Month</p>
        </Card>

        <Card className="text-center">
          <div className="w-9 h-9 mx-auto mb-2 rounded-[10px] bg-[#5856d6]/10 flex items-center justify-center">
            <TrendingUp className="w-4.5 h-4.5 text-[#5856d6]" />
          </div>
          <p className="text-xl font-bold">{stats?.totalDays || 0}</p>
          <p className="text-xs text-muted mt-0.5">Total Days</p>
        </Card>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <button
            onClick={() => router.push('/history')}
            className="text-ios-blue text-sm font-medium flex items-center gap-0.5 hover:underline"
          >
            See All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-shimmer">
                <div className="h-14" />
              </Card>
            ))}
          </div>
        ) : records.length === 0 ? (
          <Card className="text-center py-8">
            <Clock className="w-10 h-10 text-muted mx-auto mb-3" />
            <p className="text-muted text-sm">No activity yet</p>
            <p className="text-muted/60 text-xs mt-1">Your check-in history will appear here</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {records.slice(0, 5).map((record) => (
              <Card key={record.id} hoverable padding="sm">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 ${
                      record.type === 'check_in' ? 'bg-ios-green/10' : 'bg-ios-orange/10'
                    }`}
                  >
                    {record.method === 'face' ? (
                      <ScanFace className={`w-5 h-5 ${record.type === 'check_in' ? 'text-ios-green' : 'text-ios-orange'}`} />
                    ) : (
                      <MapPin className={`w-5 h-5 ${record.type === 'check_in' ? 'text-ios-green' : 'text-ios-orange'}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium capitalize">
                      {record.type.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-muted truncate">
                      via {record.method} • {formatRelativeTime(record.created_at)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      record.status === 'approved' ? 'success' :
                      record.status === 'rejected' ? 'danger' : 'warning'
                    }
                  >
                    {record.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
