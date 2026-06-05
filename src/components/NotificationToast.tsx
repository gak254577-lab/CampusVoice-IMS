/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { NotificationToast as ToastType } from '../types';

interface NotificationToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

export default function NotificationToastContainer({ toasts, onRemove }: NotificationToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => onRemove(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastType; onDismiss: () => void; key?: string }) {
  const duration = toast.duration || 5000;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const getColorStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          border: 'border-l-4 border-l-accent-green',
          icon: <CheckCircle className="w-5 h-5 text-accent-green shrink-0" />,
          progress: 'bg-accent-green'
        };
      case 'warning':
        return {
          border: 'border-l-4 border-l-accent-orange',
          icon: <AlertTriangle className="w-5 h-5 text-accent-orange shrink-0" />,
          progress: 'bg-accent-orange'
        };
      case 'error':
        return {
          border: 'border-l-4 border-l-accent-red',
          icon: <XCircle className="w-5 h-5 text-accent-red shrink-0" />,
          progress: 'bg-accent-red'
        };
      default:
        return {
          border: 'border-l-4 border-l-accent-blue',
          icon: <Info className="w-5 h-5 text-accent-blue shrink-0" />,
          progress: 'bg-accent-blue'
        };
    }
  };

  const styles = getColorStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }}
      className={`pointer-events-auto w-full rounded-2xl bg-imsec-card border border-white/[0.06] p-4 shadow-2xl relative overflow-hidden backdrop-filter backdrop-blur-xl ${styles.border}`}
    >
      <div className="flex gap-3">
        {styles.icon}
        <div className="flex-1 space-y-0.5">
          <h4 className="text-sm font-medium text-white tracking-wide">{toast.title}</h4>
          <p className="text-xs text-slate-300 font-light pr-2 leading-relaxed">{toast.message}</p>
          {toast.ticketId && (
            <div className="mt-2 text-[10px] inline-flex items-center px-2 py-0.5 rounded bg-white/5 font-mono text-accent-blue uppercase font-semibold">
              ID: {toast.ticketId}
            </div>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white transition-colors duration-150 shrink-0 select-none pb-4"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Dynamic Animated Dismiss progress bar */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: 0 }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
        className={`absolute bottom-0 left-0 h-[3px] ${styles.progress}`}
      />
    </motion.div>
  );
}
