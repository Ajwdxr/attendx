// ============================================================
// AttendX — Toast Provider
// ============================================================

'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: 'var(--card-bg)',
          color: 'var(--foreground)',
          borderRadius: '14px',
          border: '1px solid var(--border-color)',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: 'var(--shadow-lg)',
          maxWidth: '360px',
        },
        success: {
          iconTheme: {
            primary: '#34c759',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ff3b30',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}
