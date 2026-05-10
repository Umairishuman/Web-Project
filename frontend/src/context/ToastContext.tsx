import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <ToastView key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastView = ({ toast, onClose }: { toast: ToastItem; onClose: () => void }) => {
  const palette = {
    success: { bar: 'bg-green-500', icon: CheckCircle2, iconClass: 'text-green-600 bg-green-50' },
    error: { bar: 'bg-red-500', icon: AlertCircle, iconClass: 'text-red-600 bg-red-50' },
    info: { bar: 'bg-primary', icon: Info, iconClass: 'text-primary bg-primary-50' },
  } as const;

  const cfg = palette[toast.type];
  const Icon = cfg.icon;

  return (
    <div
      role="alert"
      className="pointer-events-auto animate-slide-in-right flex items-start gap-3 bg-white border border-darknavy-100 shadow-elevated rounded-xl overflow-hidden"
    >
      <div className={`w-1 self-stretch ${cfg.bar}`} />
      <div className={`shrink-0 mt-2.5 ml-1 w-8 h-8 rounded-lg flex items-center justify-center ${cfg.iconClass}`}>
        <Icon size={16} />
      </div>
      <p className="flex-1 py-3 pr-2 text-sm text-darknavy-700">{toast.message}</p>
      <button
        onClick={onClose}
        className="p-2 mr-1 mt-1 text-darknavy-400 hover:text-darknavy hover:bg-darknavy-100 rounded-lg transition-colors"
        aria-label="Close"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
