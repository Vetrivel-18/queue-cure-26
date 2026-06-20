import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  key?: string;
  id: string;
  type: 'success' | 'info' | 'warning';
  message: string;
  onClose: (id: string) => void;
}

export function Toast({ id, type, message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 5000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const bgStyles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-emerald-100',
    info: 'bg-blue-50 border-blue-200 text-blue-800 shadow-blue-100',
    warning: 'bg-amber-50 border-amber-200 text-amber-800 shadow-amber-100',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex items-start gap-3 p-4 border rounded-xl shadow-lg w-full max-w-sm ${bgStyles[type]}`}
    >
      {icons[type]}
      <div className="flex-1 text-sm font-medium pr-2 leading-relaxed">
        {message}
      </div>
      <button
        onClick={() => onClose(id)}
        className="text-gray-400 hover:text-gray-600 rounded-lg p-0.5 transition-colors focus:outline-none"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

interface ToastsContainerProps {
  toasts: { id: string; type: 'success' | 'info' | 'warning'; message: string }[];
  onClose: (id: string) => void;
}

export function ToastsContainer({ toasts, onClose }: ToastsContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm px-4 md:px-0 pointer-events-none">
      <div className="flex flex-col gap-3 pointer-events-auto">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              id={toast.id}
              type={toast.type}
              message={toast.message}
              onClose={onClose}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
