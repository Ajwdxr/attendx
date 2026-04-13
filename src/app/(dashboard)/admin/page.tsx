// ============================================================
// AttendX — Admin Dashboard Page
// ============================================================

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAttendanceStore } from '@/stores/useAttendanceStore';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import {
  Users,
  MapPin,
  Check,
  X,
  Clock,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { formatTime, formatRelativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const user = useAuthStore((s) => s.user);
  const { records, isLoading, fetchAllRecords, updateStatus } = useAttendanceStore();
  const router = useRouter();

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchAllRecords();
  }, [user, router, fetchAllRecords]);

  if (!user || user.role !== 'admin') return <PageLoader />;

  const pendingRecords = records.filter((r) => r.status === 'pending');
  const todayRecords = records.filter((r) => {
    const today = new Date();
    const recordDate = new Date(r.created_at);
    return recordDate.toDateString() === today.toDateString();
  });

  const handleApprove = async (id: string) => {
    await updateStatus(id, 'approved');
    toast.success('Record approved');
  };

  const handleReject = async (id: string) => {
    await updateStatus(id, 'rejected');
    toast.success('Record rejected');
  };

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-[12px] bg-ios-orange/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-ios-orange" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Admin</h1>
          <p className="text-sm text-muted">Manage attendance & locations</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="text-2xl font-bold text-ios-blue">{todayRecords.length}</p>
          <p className="text-xs text-muted mt-1">Today</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-ios-orange">{pendingRecords.length}</p>
          <p className="text-xs text-muted mt-1">Pending</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-ios-green">{records.length}</p>
          <p className="text-xs text-muted mt-1">Total</p>
        </Card>
      </div>

      {/* Manage Locations */}
      <Card hoverable onClick={() => router.push('/admin/locations')}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-ios-green/10 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-ios-green" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Manage Locations</p>
            <p className="text-xs text-muted">Add or edit check-in locations</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted" />
        </div>
      </Card>

      {/* Pending Approvals */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Pending Approvals</h2>
        {pendingRecords.length === 0 ? (
          <Card className="text-center py-8">
            <Check className="w-10 h-10 text-ios-green mx-auto mb-2" />
            <p className="text-sm text-muted">All caught up!</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {pendingRecords.map((record) => (
              <Card key={record.id} padding="sm">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-ios-gray-5 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-muted" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {record.user?.name || 'Unknown User'}
                    </p>
                    <p className="text-xs text-muted capitalize">
                      {record.type.replace('_', ' ')} • {record.method} • {formatRelativeTime(record.created_at)}
                    </p>
                    {record.notes && (
                      <p className="text-xs text-muted/70 mt-1 italic">&quot;{record.notes}&quot;</p>
                    )}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => handleApprove(record.id)}
                      className="w-8 h-8 rounded-full bg-ios-green/10 flex items-center justify-center text-ios-green hover:bg-ios-green/20 active:scale-90 transition-all"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleReject(record.id)}
                      className="w-8 h-8 rounded-full bg-ios-red/10 flex items-center justify-center text-ios-red hover:bg-ios-red/20 active:scale-90 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Records */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Today&apos;s Activity</h2>
        {isLoading ? (
          <PageLoader />
        ) : todayRecords.length === 0 ? (
          <Card className="text-center py-8">
            <Clock className="w-10 h-10 text-muted mx-auto mb-2" />
            <p className="text-sm text-muted">No activity today</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {todayRecords.slice(0, 10).map((record) => (
              <Card key={record.id} padding="sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-ios-gray-5 flex items-center justify-center shrink-0 text-xs font-bold">
                    {record.user?.name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{record.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-muted capitalize">
                      {record.type.replace('_', ' ')} at {formatTime(record.created_at)}
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
