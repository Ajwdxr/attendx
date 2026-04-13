// ============================================================
// AttendX — Location Checker Component
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useLocationStore } from '@/stores/useLocationStore';
import { calculateDistance, formatDistance, isWithinRadius } from '@/lib/geolocation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { MapPin, Navigation, AlertCircle, Check, Loader2 } from 'lucide-react';
import type { Location } from '@/types';

interface LocationCheckerProps {
  onLocationVerified: (location: Location, distance: number) => void;
}

export default function LocationChecker({ onLocationVerified }: LocationCheckerProps) {
  const { latitude, longitude, accuracy, error, loading, requestLocation } = useGeolocation();
  const { locations, fetchLocations, isLoading: locationsLoading } = useLocationStore();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'checking' | 'in-range' | 'out-of-range'>('idle');

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  useEffect(() => {
    if (latitude && longitude && selectedLocation) {
      const inRange = isWithinRadius(
        latitude,
        longitude,
        selectedLocation.latitude,
        selectedLocation.longitude,
        selectedLocation.radius
      );
      setVerificationStatus(inRange ? 'in-range' : 'out-of-range');

      if (inRange) {
        const distance = calculateDistance(latitude, longitude, selectedLocation.latitude, selectedLocation.longitude);
        onLocationVerified(selectedLocation, distance);
      }
    }
  }, [latitude, longitude, selectedLocation, onLocationVerified]);

  const getDistanceToLocation = (loc: Location): number | null => {
    if (!latitude || !longitude) return null;
    return calculateDistance(latitude, longitude, loc.latitude, loc.longitude);
  };

  return (
    <div className="space-y-4">
      {/* Location Status */}
      <Card>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${
            latitude ? 'bg-ios-green/10' : 'bg-ios-gray-5'
          }`}>
            {loading ? (
              <Loader2 className="w-5 h-5 text-ios-blue animate-spin" />
            ) : latitude ? (
              <Navigation className="w-5 h-5 text-ios-green" />
            ) : (
              <MapPin className="w-5 h-5 text-muted" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">
              {loading ? 'Getting location...' : latitude ? 'Location acquired' : 'Location needed'}
            </p>
            {latitude && (
              <p className="text-xs text-muted">
                Accuracy: ±{accuracy ? `${Math.round(accuracy)}m` : 'unknown'}
              </p>
            )}
            {error && (
              <p className="text-xs text-ios-red mt-0.5">{error}</p>
            )}
          </div>
          {!latitude && !loading && (
            <Button size="sm" onClick={requestLocation}>
              Enable
            </Button>
          )}
        </div>
      </Card>

      {/* Radius Visualization */}
      {selectedLocation && latitude && longitude && (
        <Card className="relative overflow-hidden">
          <div className="flex flex-col items-center py-4">
            {/* Visual radius indicator */}
            <div className="relative w-48 h-48 mb-4">
              {/* Outer radius ring */}
              <div className={`absolute inset-0 rounded-full border-2 border-dashed ${
                verificationStatus === 'in-range' ? 'border-ios-green' : 'border-ios-red'
              } opacity-30`} />
              
              {/* Animated pulse rings */}
              <div className={`absolute inset-4 rounded-full ${
                verificationStatus === 'in-range' ? 'bg-ios-green/5' : 'bg-ios-red/5'
              }`} />

              {/* Center point (target location) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className={`w-4 h-4 rounded-full ${
                  verificationStatus === 'in-range' ? 'bg-ios-green' : 'bg-ios-red'
                }`}>
                  <div className={`absolute inset-0 rounded-full animate-pulse-ring ${
                    verificationStatus === 'in-range' ? 'bg-ios-green/30' : 'bg-ios-red/30'
                  }`} />
                </div>
              </div>

              {/* User position dot */}
              {(() => {
                const dist = getDistanceToLocation(selectedLocation);
                const relativePos = dist !== null ? Math.min(dist / selectedLocation.radius, 1.5) : 0;
                const offsetX = relativePos * 40;
                return (
                  <div
                    className="absolute w-3 h-3 rounded-full bg-ios-blue shadow-[0_0_8px_rgba(0,122,255,0.5)]"
                    style={{
                      top: `calc(50% - 6px - ${offsetX}px)`,
                      left: `calc(50% - 6px + ${offsetX * 0.3}px)`,
                    }}
                  />
                );
              })()}

              {/* Radius label */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-muted bg-background px-2">
                {selectedLocation.radius}m radius
              </div>
            </div>

            {/* Status */}
            <div className="text-center">
              {verificationStatus === 'in-range' ? (
                <div className="flex items-center gap-2 text-ios-green">
                  <Check className="w-5 h-5" />
                  <span className="font-semibold">You&apos;re within range</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-ios-red">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-semibold">Out of range</span>
                </div>
              )}
              {(() => {
                const dist = getDistanceToLocation(selectedLocation);
                return dist !== null && (
                  <p className="text-xs text-muted mt-1">
                    Distance: {formatDistance(dist)}
                  </p>
                );
              })()}
            </div>
          </div>
        </Card>
      )}

      {/* Available Locations */}
      <div>
        <h3 className="text-sm font-semibold text-muted mb-3 ml-1">Select Check-in Location</h3>
        {locationsLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-shimmer">
                <div className="h-16" />
              </Card>
            ))}
          </div>
        ) : locations.length === 0 ? (
          <Card className="text-center py-6">
            <MapPin className="w-8 h-8 text-muted mx-auto mb-2" />
            <p className="text-sm text-muted">No check-in locations configured</p>
            <p className="text-xs text-muted/60 mt-1">Ask your admin to add locations</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {locations.map((loc) => {
              const distance = getDistanceToLocation(loc);
              const inRange = distance !== null && distance <= loc.radius;

              return (
                <Card
                  key={loc.id}
                  hoverable
                  padding="sm"
                  onClick={() => {
                    setSelectedLocation(loc);
                    if (!latitude) requestLocation();
                  }}
                  className={`cursor-pointer ${
                    selectedLocation?.id === loc.id ? 'ring-2 ring-ios-blue' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 ${
                      inRange ? 'bg-ios-green/10' : 'bg-ios-gray-5'
                    }`}>
                      <MapPin className={`w-5 h-5 ${inRange ? 'text-ios-green' : 'text-muted'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{loc.name}</p>
                      {loc.address && (
                        <p className="text-xs text-muted truncate">{loc.address}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      {distance !== null ? (
                        <Badge variant={inRange ? 'success' : 'default'}>
                          {formatDistance(distance)}
                        </Badge>
                      ) : (
                        <Badge>--</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
