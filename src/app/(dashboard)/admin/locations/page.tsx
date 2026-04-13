// ============================================================
// AttendX — Admin Locations Management Page
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLocationStore } from '@/stores/useLocationStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Spinner';
import {
  MapPin,
  Plus,
  Trash2,
  ArrowLeft,
  Navigation,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLocationsPage() {
  const user = useAuthStore((s) => s.user);
  const { locations, isLoading, fetchLocations, createLocation, deleteLocation } = useLocationStore();
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    radius: '100',
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchLocations();
  }, [user, router, fetchLocations]);

  const handleCreate = async () => {
    if (!newLocation.name || !newLocation.latitude || !newLocation.longitude) {
      toast.error('Please fill in all required fields');
      return;
    }

    const result = await createLocation({
      name: newLocation.name,
      address: newLocation.address || undefined,
      latitude: parseFloat(newLocation.latitude),
      longitude: parseFloat(newLocation.longitude),
      radius: parseFloat(newLocation.radius) || 100,
      is_active: true,
    });

    if (result.success) {
      toast.success('Location added!');
      setShowAddModal(false);
      setNewLocation({ name: '', address: '', latitude: '', longitude: '', radius: '100' });
    } else {
      toast.error(result.error || 'Failed to add location');
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNewLocation((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        toast.success('Current location captured');
      },
      () => toast.error('Failed to get location')
    );
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete location "${name}"?`)) {
      await deleteLocation(id);
      toast.success('Location removed');
    }
  };

  if (!user || user.role !== 'admin') return <PageLoader />;

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
        <div className="flex-1">
          <h1 className="text-xl font-bold">Locations</h1>
          <p className="text-xs text-muted">Manage check-in locations</p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowAddModal(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Add
        </Button>
      </div>

      {/* Locations List */}
      {isLoading ? (
        <PageLoader />
      ) : locations.length === 0 ? (
        <Card className="text-center py-12">
          <MapPin className="w-12 h-12 text-muted mx-auto mb-3" />
          <p className="text-muted font-medium">No locations yet</p>
          <p className="text-sm text-muted/60 mt-1 mb-4">Add your first check-in location</p>
          <Button onClick={() => setShowAddModal(true)} icon={<Plus className="w-4 h-4" />}>
            Add Location
          </Button>
        </Card>
      ) : (
        <div className="space-y-2 stagger-children">
          {locations.map((loc) => (
            <Card key={loc.id} padding="sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-ios-green/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-ios-green" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{loc.name}</p>
                  {loc.address && (
                    <p className="text-xs text-muted truncate">{loc.address}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="info">{loc.radius}m radius</Badge>
                    <span className="text-[10px] text-muted">
                      {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(loc.id, loc.name)}
                  className="w-8 h-8 rounded-full bg-ios-red/10 flex items-center justify-center text-ios-red hover:bg-ios-red/20 active:scale-90 transition-all shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Location Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Location"
      >
        <div className="space-y-4">
          <Input
            label="Location Name"
            placeholder="e.g., Main Office"
            value={newLocation.name}
            onChange={(e) => setNewLocation((prev) => ({ ...prev, name: e.target.value }))}
            icon={<MapPin className="w-5 h-5" />}
          />
          <Input
            label="Address (optional)"
            placeholder="123 Business St"
            value={newLocation.address}
            onChange={(e) => setNewLocation((prev) => ({ ...prev, address: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Latitude"
              placeholder="3.1390"
              type="number"
              value={newLocation.latitude}
              onChange={(e) => setNewLocation((prev) => ({ ...prev, latitude: e.target.value }))}
            />
            <Input
              label="Longitude"
              placeholder="101.6869"
              type="number"
              value={newLocation.longitude}
              onChange={(e) => setNewLocation((prev) => ({ ...prev, longitude: e.target.value }))}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGetCurrentLocation}
            icon={<Navigation className="w-4 h-4" />}
          >
            Use Current Location
          </Button>
          <Input
            label="Radius (meters)"
            placeholder="100"
            type="number"
            value={newLocation.radius}
            onChange={(e) => setNewLocation((prev) => ({ ...prev, radius: e.target.value }))}
          />
          <Button fullWidth size="lg" onClick={handleCreate}>
            Add Location
          </Button>
        </div>
      </Modal>
    </div>
  );
}
