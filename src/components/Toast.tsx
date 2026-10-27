import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'reward';
}

interface ToastProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-5 right-5 z-[10000] space-y-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onClose: (id: string) => void }> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const getStyle = () => {
    switch (toast.type) {
      case 'success':
        return 'border-emerald-500/50 bg-emerald-950/90 text-emerald-400 shadow-emerald-900/30';
      case 'error':
        return 'border-rose-500/50 bg-rose-950/90 text-rose-400 shadow-rose-900/30';
      case 'reward':
        return 'border-amber-500/50 bg-amber-950/90 text-amber-400 shadow-amber-900/30';
      default:
        return 'border-sky-500/50 bg-sky-950/90 text-sky-400 shadow-sky-900/30';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />;
      case 'reward':
      default:
        return <Info className="w-5 h-5 text-sky-400 shrink-0" />;
    }
  };

  return (
    <div
      className={`pointer-events-auto clip-hud border backdrop-blur-md p-4 flex items-start gap-3 shadow-2xl transition-all duration-300 animate-slide-in ${getStyle()}`}
    >
      {getIcon()}
      <div className="flex-1 text-xs font-space font-extrabold leading-snug">
        {toast.message}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="text-white/60 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};