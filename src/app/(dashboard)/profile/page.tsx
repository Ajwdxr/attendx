// ============================================================
// AttendX — Profile Page
// ============================================================

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import FaceScanner from '@/components/attendance/FaceScanner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import {
  UserCircle,
  ScanFace,
  Shield,
  Bell,
  LogOut,
  ChevronRight,
  Camera,
  Check,
  Mail,
  Calendar,
} from 'lucide-react';
import { getInitials, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut, updateProfile } = useAuthStore();
  const [showFaceEnroll, setShowFaceEnroll] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleFaceEnroll = useCallback(async (descriptor: number[]) => {
    await updateProfile({ face_descriptor: descriptor });
    setShowFaceEnroll(false);
    toast.success('Face registered successfully!');
  }, [updateProfile]);

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
    toast.success('Logged out successfully');
  };

  if (!user) return null;

  const menuItems = [
    {
      icon: <ScanFace className="w-5 h-5 text-ios-blue" />,
      label: 'Face Recognition',
      description: user.face_descriptor ? 'Registered' : 'Not registered',
      badge: user.face_descriptor ? 'success' as const : 'warning' as const,
      action: () => setShowFaceEnroll(true),
    },
    {
      icon: <Bell className="w-5 h-5 text-ios-orange" />,
      label: 'Notifications',
      description: 'Push notifications',
      action: () => toast('Notification settings coming soon'),
    },
    {
      icon: <Shield className="w-5 h-5 text-ios-green" />,
      label: 'Privacy & Security',
      description: 'Manage your data',
      action: () => toast('Privacy settings coming soon'),
    },
  ];

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted mt-0.5">Manage your account</p>
      </div>

      {/* User Card */}
      <Card className="text-center py-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-br from-ios-blue to-[#5856d6]" />
        <div className="relative z-10 pt-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-ios-blue to-[#5856d6] flex items-center justify-center text-white text-2xl font-bold border-4 border-card shadow-[var(--shadow-lg)]">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              getInitials(user.name)
            )}
          </div>
          <h2 className="text-lg font-bold mt-3">{user.name}</h2>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <Mail className="w-3.5 h-3.5 text-muted" />
            <p className="text-sm text-muted">{user.email}</p>
          </div>
          <div className="flex items-center justify-center gap-3 mt-3">
            <Badge variant={user.role === 'admin' ? 'info' : 'default'} dot>
              {user.role === 'admin' ? 'Admin' : 'Employee'}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted">
              <Calendar className="w-3 h-3" />
              Joined {formatDate(user.created_at, { month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>
      </Card>

      {/* Face Registration Status */}
      {!user.face_descriptor && (
        <Card
          variant="default"
          hoverable
          onClick={() => setShowFaceEnroll(true)}
          className="border-ios-blue/30 bg-ios-blue/5"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[12px] bg-ios-blue/10 flex items-center justify-center">
              <Camera className="w-5.5 h-5.5 text-ios-blue" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-ios-blue">Register Your Face</p>
              <p className="text-xs text-muted mt-0.5">Required for face recognition check-in</p>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-ios-blue" />
          </div>
        </Card>
      )}

      {/* Menu Items */}
      <Card padding="none">
        {menuItems.map((item, index) => (
          <button
            key={item.label}
            onClick={item.action}
            className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-card-hover transition-colors active:bg-ios-gray-5 ${
              index > 0 ? 'border-t border-border' : ''
            }`}
          >
            <div className="w-9 h-9 rounded-[10px] bg-ios-gray-6 flex items-center justify-center shrink-0">
              {item.icon}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted">{item.description}</p>
            </div>
            {item.badge && (
              <Badge variant={item.badge}>
                {item.badge === 'success' ? <Check className="w-3 h-3" /> : '!'}
              </Badge>
            )}
            <ChevronRight className="w-4 h-4 text-muted" />
          </button>
        ))}
      </Card>

      {/* Admin Panel link */}
      {user.role === 'admin' && (
        <Card hoverable onClick={() => router.push('/admin')} className="border-ios-orange/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-ios-orange/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-ios-orange" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Admin Panel</p>
              <p className="text-xs text-muted">Manage locations & employees</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted" />
          </div>
        </Card>
      )}

      {/* Logout */}
      <Button
        variant="danger"
        fullWidth
        size="lg"
        onClick={() => setShowLogoutConfirm(true)}
        icon={<LogOut className="w-5 h-5" />}
      >
        Sign Out
      </Button>

      {/* Face Enrollment Modal */}
      <Modal
        isOpen={showFaceEnroll}
        onClose={() => setShowFaceEnroll(false)}
        title="Register Face"
        size="lg"
      >
        <p className="text-sm text-muted mb-4">
          Position your face within the frame and capture. This will be used for future check-ins.
        </p>
        <FaceScanner
          onScanComplete={handleFaceEnroll}
          mode="enroll"
        />
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Sign Out"
        size="sm"
      >
        <p className="text-sm text-muted mb-5">
          Are you sure you want to sign out of AttendX?
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setShowLogoutConfirm(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </div>
      </Modal>
    </div>
  );
}
