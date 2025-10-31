'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
}

interface Toast extends ToastOptions {
  id: string;
  createdAt: number;
}

interface ToastContextValue {
  show: (options: ToastOptions) => void;
  dismiss: (id: string) => void;
  toasts: Toast[];
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    ({ title, description, variant = 'info', durationMs = 3500 }: ToastOptions) => {
      const id = Math.random().toString(36).slice(2);
      const toast: Toast = {
        id,
        title,
        description,
        variant,
        createdAt: Date.now(),
      };
      setToasts((prev) => [...prev, toast]);
      if (durationMs > 0) {
        setTimeout(() => dismiss(id), durationMs);
      }
    },
    [dismiss]
  );

  const value = useMemo(() => ({ show, dismiss, toasts }), [show, dismiss, toasts]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

function ToastViewport() {
  const { toasts, dismiss } = useToast();
  return (
    <div className='fixed bottom-4 right-4 z-50 flex flex-col gap-3'>
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`w-80 rounded-lg shadow-lg border p-4 bg-white dark:bg-gray-800 transition-all
            ${t.variant === 'success' ? 'border-green-200 dark:border-green-800' : ''}
            ${t.variant === 'error' ? 'border-red-200 dark:border-red-800' : ''}
            ${t.variant === 'info' ? 'border-blue-200 dark:border-blue-800' : ''}
            ${t.variant === 'warning' ? 'border-yellow-200 dark:border-yellow-800' : ''}
          `}
        >
          <div className='flex items-start gap-3'>
            <span
              className={`mt-0.5 inline-block h-2.5 w-2.5 rounded-full
                ${t.variant === 'success' ? 'bg-green-500' : ''}
                ${t.variant === 'error' ? 'bg-red-500' : ''}
                ${t.variant === 'info' ? 'bg-blue-500' : ''}
                ${t.variant === 'warning' ? 'bg-yellow-500' : ''}
              `}
            />
            <div className='flex-1'>
              <p className='text-sm font-medium text-gray-900 dark:text-white'>{t.title}</p>
              {t.description && (
                <p className='mt-1 text-sm text-gray-600 dark:text-gray-300'>{t.description}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className='text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}


