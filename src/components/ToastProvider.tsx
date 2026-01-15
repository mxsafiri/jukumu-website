'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Toast from '@/components/Toast';

type ToastType = 'success' | 'error' | 'info';

type ToastItem = {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
};

type ToastContextValue = {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function inferTypeFromMessage(message: string): ToastType {
  const m = message.toLowerCase();
  if (m.includes('imefanikiwa') || m.includes('success') || m.includes('successfully')) return 'success';
  if (m.includes('hitilafu') || m.includes('error') || m.includes('failed') || m.includes('imefeli')) return 'error';
  return 'info';
}

function makeId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const originalAlert = useRef<typeof window.alert | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration?: number) => {
    const id = makeId();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const closeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!originalAlert.current) originalAlert.current = window.alert;

    window.alert = ((message?: string) => {
      const msg = typeof message === 'string' ? message : String(message);
      showToast(msg, inferTypeFromMessage(msg));
    }) as typeof window.alert;

    return () => {
      if (originalAlert.current) window.alert = originalAlert.current;
    };
  }, [showToast]);

  const value = useMemo<ToastContextValue>(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
          {toasts.map((t) => (
            <Toast
              key={t.id}
              message={t.message}
              type={t.type}
              duration={t.duration}
              onClose={() => closeToast(t.id)}
              fixed={false}
            />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}
