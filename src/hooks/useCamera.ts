// ============================================================
// AttendX — Camera Hook
// ============================================================

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface CameraState {
  stream: MediaStream | null;
  isActive: boolean;
  error: string | null;
  facingMode: 'user' | 'environment';
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>({
    stream: null,
    isActive: false,
    error: null,
    facingMode: 'user',
  });

  const startCamera = useCallback(async (facingMode: 'user' | 'environment' = 'user') => {
    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch((err) => {
          console.warn('[useCamera] Play interrupted during start:', err);
        });
      }

      setState({
        stream,
        isActive: true,
        error: null,
        facingMode,
      });
    } catch (err) {
      const error = err as Error;
      let errorMessage = 'Unable to access camera';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please enable it in your browser settings.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.';
      }
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isActive: false,
      }));
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setState((prev) => ({
      ...prev,
      stream: null,
      isActive: false,
    }));
  }, []);

  const switchCamera = useCallback(() => {
    const newMode = state.facingMode === 'user' ? 'environment' : 'user';
    startCamera(newMode);
  }, [state.facingMode, startCamera]);

  const captureFrame = useCallback((): HTMLCanvasElement | null => {
    if (!videoRef.current) return null;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
    }
    return canvas;
  }, []);

  // Sync stream to video element when it becomes available in the DOM
  useEffect(() => {
    if (state.stream && videoRef.current) {
      videoRef.current.srcObject = state.stream;
      videoRef.current.play().catch((err) => {
        console.warn('[useCamera] Play interrupted during stream sync:', err);
      });
    }
  }, [state.stream, state.isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    videoRef,
    ...state,
    startCamera,
    stopCamera,
    switchCamera,
    captureFrame,
  };
}
