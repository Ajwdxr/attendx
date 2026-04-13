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
  const [state, setState] = useState<CameraState>({
    stream: null,
    isActive: false,
    error: null,
    facingMode: 'user',
  });

  const startCamera = useCallback(async (facingMode: 'user' | 'environment' = 'user') => {
    try {
      // Stop any existing stream
      if (state.stream) {
        state.stream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
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
  }, [state.stream]);

  const stopCamera = useCallback(() => {
    if (state.stream) {
      state.stream.getTracks().forEach((track) => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setState((prev) => ({
      ...prev,
      stream: null,
      isActive: false,
    }));
  }, [state.stream]);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.stream) {
        state.stream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
