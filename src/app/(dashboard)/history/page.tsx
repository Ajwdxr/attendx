// ============================================================
// AttendX — Attendance History Page
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAttendanceStore } from '@/stores/useAttendanceStore';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import { Clock, ScanFace, MapPin, PenLine, Filter, Calendar } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';
import type { CheckInMethod } from '@/types';

export default function HistoryPage() {
  const user = useAuthStore((s) => s.user);
  const { records, isLoading, fetchRecords } = useAttendanceStore();
  const [filter, setFilter] = useState<'all' | CheckInMethod>('all');

  useEffect(() => {
    if (user) fetchRecords(user.id);
  }, [user, fetchRecords]);

  if (!user) return <PageLoader />;

  const filteredRecords = filter === 'all'
    ? records
    : records.filter((r) => r.method === filter);

  // Group records by date
  const groupedRecords = filteredRecords.reduce((groups, record) => {
    const date = formatDate(record.created_at);
    if (!groups[date]) groups[date] = [];
    groups[date].push(record);
    return groups;
  }, {} as Record<string, typeof records>);

  const methodIcon = (method: string) => {
    switch (method) {
      case 'face': return <ScanFace className="w-4 h-4" />;
      case 'location': return <MapPin className="w-4 h-4" />;
      default: return <PenLine className="w-4 h-4" />;
    }
  };

  const filters: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'face', label: 'Face' },
    { key: 'location', label: 'Location' },
    { key: 'manual', label: 'Manual' },
  ];

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">History</h1>
        <p className="text-sm text-muted mt-0.5">Your attendance records</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted shrink-0" />
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                filter === f.key
                  ? 'bg-ios-blue text-white'
                  : 'bg-ios-gray-5 text-muted hover:bg-ios-gray-4'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Records */}
      {isLoading ? (
        <PageLoader />
      ) : Object.keys(groupedRecords).length === 0 ? (
        <Card className="text-center py-12">
          <Calendar className="w-12 h-12 text-muted mx-auto mb-3" />
          <p className="text-muted font-medium">No records found</p>
          <p className="text-muted/60 text-sm mt-1">
            {filter !== 'all' ? 'Try a different filter' : 'Start checking in to see your history'}
          </p>
        </Card>
      ) : (
        <div className="space-y-6 stagger-children">
          {Object.entries(groupedRecords).map(([date, dayRecords]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-3.5 h-3.5 text-muted" />
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
                  {date}
                </h3>
              </div>
              <div className="space-y-2">
                {dayRecords.map((record) => (
                  <Card key={record.id} padding="sm">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 ${
                        record.type === 'check_in'
                          ? 'bg-ios-green/10 text-ios-green'
                          : 'bg-ios-orange/10 text-ios-orange'
                      }`}>
                        {methodIcon(record.method)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium capitalize">
                            {record.type.replace('_', ' ')}
                          </p>
                          <Badge
                            variant={
                              record.status === 'approved' ? 'success' :
                              record.status === 'rejected' ? 'danger' : 'warning'
                            }
                          >
                            {record.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted mt-0.5">
                          {formatTime(record.created_at)} • via {record.method}
                          {record.face_match_score && ` • ${Math.round(record.face_match_score * 100)}% match`}
                        </p>
                        {record.notes && (
                          <p className="text-xs text-muted/70 mt-1 italic">&quot;{record.notes}&quot;</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
