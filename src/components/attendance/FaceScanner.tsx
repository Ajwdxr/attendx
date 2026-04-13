// ============================================================
// AttendX — Face Scanner Component
// ============================================================

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useCamera } from '@/hooks/useCamera';
import Button from '@/components/ui/Button';
import { ScanFace, Camera, CameraOff, RefreshCw, Check, X } from 'lucide-react';

interface FaceScannerProps {
  onScanComplete: (descriptor: number[], confidence: number) => void;
  storedDescriptor?: number[] | null;
  mode?: 'verify' | 'enroll';
}

export default function FaceScanner({ onScanComplete, storedDescriptor, mode = 'verify' }: FaceScannerProps) {
  const { videoRef, isActive, error, startCamera, stopCamera, switchCamera } = useCamera();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'matched' | 'failed'>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const animationRef = useRef<number | null>(null);

  // Simulated face detection loop (face-api.js would be loaded here)
  const startDetection = useCallback(async () => {
    if (!isActive || !videoRef.current) return;
    setStatus('scanning');
    setScanProgress(0);

    // Simulate face detection progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        // Generate simulated face descriptor (128-float vector)
        const descriptor = Array.from({ length: 128 }, () => Math.random() * 2 - 1);

        if (mode === 'enroll' || !storedDescriptor) {
          // Enrollment mode — accept the face
          setStatus('matched');
          setTimeout(() => onScanComplete(descriptor, 0.95), 500);
        } else {
          // Verification mode — compare with stored descriptor
          // In production, use face-api.js euclidean distance
          const confidence = 0.85 + Math.random() * 0.1;
          if (confidence > 0.6) {
            setStatus('matched');
            setTimeout(() => onScanComplete(descriptor, confidence), 500);
          } else {
            setStatus('failed');
          }
        }
      }
      setScanProgress(Math.min(progress, 100));
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, videoRef, mode, storedDescriptor, onScanComplete]);

  useEffect(() => {
    return () => {
      stopCamera();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      {/* Camera viewport */}
      <div className="relative aspect-[3/4] max-h-[400px] bg-black rounded-[var(--radius-ios-md)] overflow-hidden">
        {isActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />

            {/* Face frame overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`w-56 h-72 border-2 rounded-[40px] transition-colors duration-300 ${
                  status === 'matched'
                    ? 'border-ios-green shadow-[0_0_30px_rgba(52,199,89,0.3)]'
                    : status === 'failed'
                    ? 'border-ios-red shadow-[0_0_30px_rgba(255,59,48,0.3)]'
                    : status === 'scanning'
                    ? 'border-ios-blue shadow-[0_0_20px_rgba(0,122,255,0.2)]'
                    : 'border-white/50'
                }`}
              >
                {/* Corner markers */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-3 border-l-3 border-white rounded-tl-[40px]" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-3 border-r-3 border-white rounded-tr-[40px]" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-3 border-l-3 border-white rounded-bl-[40px]" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-3 border-r-3 border-white rounded-br-[40px]" />

                {/* Scan line */}
                {status === 'scanning' && (
                  <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-ios-blue to-transparent animate-scan-line" />
                )}
              </div>
            </div>

            {/* Status overlay */}
            {status === 'matched' && (
              <div className="absolute inset-0 flex items-center justify-center bg-ios-green/20">
                <div className="w-20 h-20 rounded-full bg-ios-green flex items-center justify-center animate-check-bounce">
                  <Check className="w-10 h-10 text-white" />
                </div>
              </div>
            )}

            {status === 'failed' && (
              <div className="absolute inset-0 flex items-center justify-center bg-ios-red/20">
                <div className="w-20 h-20 rounded-full bg-ios-red flex items-center justify-center animate-check-bounce">
                  <X className="w-10 h-10 text-white" />
                </div>
              </div>
            )}

            {/* Progress bar */}
            {status === 'scanning' && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-ios-blue rounded-full transition-all duration-200"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
                <p className="text-white text-xs text-center mt-2 font-medium">
                  Scanning face... {Math.round(scanProgress)}%
                </p>
              </div>
            )}

            {/* Camera controls */}
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={switchCamera}
                className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white active:scale-90 transition-transform"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={stopCamera}
                className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white active:scale-90 transition-transform"
              >
                <CameraOff className="w-4 h-4" />
              </button>
            </div>

            {/* Hidden canvas for processing */}
            <canvas ref={canvasRef} className="hidden" />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white/70">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center">
              <ScanFace className="w-10 h-10" />
            </div>
            <div className="text-center">
              <p className="font-medium">Camera is off</p>
              <p className="text-sm text-white/50 mt-1">
                {mode === 'enroll' ? 'Enable camera to register your face' : 'Enable camera to verify identity'}
              </p>
            </div>
            {error && (
              <p className="text-ios-red text-xs text-center px-6">{error}</p>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        {!isActive ? (
          <Button
            onClick={() => startCamera('user')}
            fullWidth
            size="lg"
            icon={<Camera className="w-5 h-5" />}
          >
            Start Camera
          </Button>
        ) : status === 'idle' || status === 'failed' ? (
          <Button
            onClick={startDetection}
            fullWidth
            size="lg"
            variant={status === 'failed' ? 'danger' : 'primary'}
            icon={<ScanFace className="w-5 h-5" />}
          >
            {status === 'failed' ? 'Try Again' : mode === 'enroll' ? 'Capture Face' : 'Verify Face'}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
