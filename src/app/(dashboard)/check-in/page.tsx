// ============================================================
// AttendX — Check-In Page
// ============================================================

'use client';

import { useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAttendanceStore } from '@/stores/useAttendanceStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import FaceScanner from '@/components/attendance/FaceScanner';
import LocationChecker from '@/components/attendance/LocationChecker';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ScanFace, MapPin, PenLine, Check, ArrowLeft } from 'lucide-react';
import type { Location, AttendanceType, CheckInMethod } from '@/types';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

type Tab = 'face' | 'location' | 'manual';

export default function CheckInPage() {
  const searchParams = useSearchParams();
  const isCheckOut = searchParams.get('type') === 'out';
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const submitCheckIn = useAttendanceStore((s) => s.submitCheckIn);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [activeTab, setActiveTab] = useState<Tab>('face');
  const [faceVerified, setFaceVerified] = useState(false);
  const [faceScore, setFaceScore] = useState<number | null>(null);
  const [locationVerified, setLocationVerified] = useState(false);
  const [verifiedLocation, setVerifiedLocation] = useState<Location | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [notes, setNotes] = useState('');

  const attendanceType: AttendanceType = isCheckOut ? 'check_out' : 'check_in';

  const handleFaceScan = useCallback((descriptor: number[], confidence: number) => {
    setFaceVerified(true);
    setFaceScore(confidence);
    toast.success(`Face verified (${Math.round(confidence * 100)}% match)`);
  }, []);

  const handleLocationVerified = useCallback((location: Location) => {
    setLocationVerified(true);
    setVerifiedLocation(location);
    toast.success(`Location verified: ${location.name}`);
  }, []);

  const handleSubmit = async (method: CheckInMethod) => {
    if (!user) return;
    setSubmitting(true);

    const result = await submitCheckIn({
      userId: user.id,
      type: attendanceType,
      method,
      latitude: verifiedLocation?.latitude,
      longitude: verifiedLocation?.longitude,
      locationId: verifiedLocation?.id,
      faceMatchScore: faceScore ?? undefined,
      notes: notes || undefined,
    });

    if (result.success) {
      setSuccess(true);
      addNotification({
        title: isCheckOut ? 'Checked Out' : 'Checked In',
        message: `Successfully ${isCheckOut ? 'checked out' : 'checked in'} via ${method}`,
        type: 'success',
      });
      toast.success(isCheckOut ? 'Checked out successfully!' : 'Checked in successfully!');
      setTimeout(() => router.push('/dashboard'), 1500);
    } else {
      toast.error(result.error || 'Failed to submit. Please try again.');
    }

    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="p-5 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-24 h-24 rounded-full bg-ios-green flex items-center justify-center animate-check-bounce mb-6">
          <Check className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {isCheckOut ? 'Checked Out!' : 'Checked In!'}
        </h2>
        <p className="text-muted text-sm">
          {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    );
  }

  const tabs: { key: Tab; icon: React.ReactNode; label: string }[] = [
    { key: 'face', icon: <ScanFace className="w-4.5 h-4.5" />, label: 'Face' },
    { key: 'location', icon: <MapPin className="w-4.5 h-4.5" />, label: 'Location' },
    { key: 'manual', icon: <PenLine className="w-4.5 h-4.5" />, label: 'Manual' },
  ];

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center active:scale-90 transition-transform"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </button>
        <div>
          <h1 className="text-xl font-bold">
            {isCheckOut ? 'Check Out' : 'Check In'}
          </h1>
          <p className="text-xs text-muted">
            Verify your identity to {isCheckOut ? 'check out' : 'check in'}
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-ios-gray-5 rounded-[var(--radius-ios-sm)] p-1 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-card text-foreground shadow-[var(--shadow-sm)]'
                : 'text-muted'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in" key={activeTab}>
        {activeTab === 'face' && (
          <div className="space-y-4">
            <FaceScanner
              onScanComplete={handleFaceScan}
              storedDescriptor={user?.face_descriptor}
              mode="verify"
            />
            {faceVerified && (
              <Button
                fullWidth
                size="lg"
                loading={submitting}
                onClick={() => handleSubmit('face')}
                icon={<Check className="w-5 h-5" />}
              >
                Confirm {isCheckOut ? 'Check Out' : 'Check In'}
              </Button>
            )}
          </div>
        )}

        {activeTab === 'location' && (
          <div className="space-y-4">
            <LocationChecker onLocationVerified={handleLocationVerified} />
            {locationVerified && (
              <Button
                fullWidth
                size="lg"
                loading={submitting}
                onClick={() => handleSubmit('location')}
                icon={<Check className="w-5 h-5" />}
              >
                Confirm {isCheckOut ? 'Check Out' : 'Check In'}
              </Button>
            )}
          </div>
        )}

        {activeTab === 'manual' && (
          <div className="space-y-4">
            <Card>
              <p className="text-sm text-muted mb-3">
                Manual check-in requires admin approval. Please add a note explaining why.
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Camera not working, outside office area..."
                className="w-full h-28 bg-input-bg rounded-[var(--radius-ios-sm)] p-3 text-sm outline-none resize-none border-2 border-transparent focus:border-ios-blue focus:bg-card transition-all"
              />
            </Card>
            <Button
              fullWidth
              size="lg"
              loading={submitting}
              onClick={() => handleSubmit('manual')}
              disabled={!notes.trim()}
              icon={<PenLine className="w-5 h-5" />}
              variant="secondary"
            >
              Submit Manual {isCheckOut ? 'Check Out' : 'Check In'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
