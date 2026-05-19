import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToast } from '@/context/AuthContext';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-[100] space-y-3 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onClose,
}: {
  toast: { id: string; type: string; title: string; message?: string };
  onClose: () => void;
}) {
  const icons: Record<string, React.ReactNode> = {
    success: <CheckCircle className="w-5 h-5 text-success-400" />,
    error: <AlertCircle className="w-5 h-5 text-danger-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning-400" />,
    info: <Info className="w-5 h-5 text-primary-400" />,
  };

  const borders: Record<string, string> = {
    success: 'border-l-success-500',
    error: 'border-l-danger-500',
    warning: 'border-l-warning-500',
    info: 'border-l-primary-500',
  };

  return (
    <div
      className={`glass rounded-xl p-4 shadow-2xl shadow-black/30 border-l-4 ${
        borders[toast.type]
      } animate-slide-right flex items-start gap-3 w-full sm:min-w-[320px]`}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-surface-100">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-surface-400 mt-0.5">{toast.message}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 rounded-lg text-surface-500 hover:text-surface-300 hover:bg-surface-700/50 transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
