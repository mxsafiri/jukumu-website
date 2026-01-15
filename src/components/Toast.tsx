'use client';

import { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
  fixed?: boolean;
}

export default function Toast({ message, type = 'info', onClose, duration = 3000, fixed = true }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    info: InformationCircleIcon,
  };

  const colors = {
    success: 'border-green-200 bg-green-50/90 text-green-900',
    error: 'border-red-200 bg-red-50/90 text-red-900',
    info: 'border-blue-200 bg-blue-50/90 text-blue-900',
  };

  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    info: 'text-blue-600',
  };

  const Icon = icons[type];

  return (
    <div className={`${fixed ? 'fixed top-4 right-4 z-50' : ''} animate-slide-in`}>
      <div
        className={`${colors[type]} relative overflow-hidden rounded-xl border shadow-lg backdrop-blur px-4 py-3 pr-10 max-w-sm`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg border bg-white/70 ${
              type === 'success'
                ? 'border-green-200'
                : type === 'error'
                  ? 'border-red-200'
                  : 'border-blue-200'
            }`}
          >
            <Icon className={`h-5 w-5 ${iconColors[type]} flex-shrink-0`} />
          </div>
          <p className="text-sm font-medium leading-5">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors"
          aria-label="Close"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
        <div
          className={`absolute bottom-0 left-0 h-1 w-full ${
            type === 'success' ? 'bg-green-500/60' : type === 'error' ? 'bg-red-500/60' : 'bg-blue-500/60'
          }`}
        />
      </div>
    </div>
  );
}
