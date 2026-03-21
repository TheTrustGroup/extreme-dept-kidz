"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useToastStore, type Toast, type ToastType } from "@/lib/stores/toast-store";

const ICONS: Record<ToastType, React.ReactNode> = {
  success: (
    <CheckCircle size={16} strokeWidth={1.5} aria-hidden="true" />
  ),
  error: (
    <AlertCircle size={16} strokeWidth={1.5} aria-hidden="true" />
  ),
  info: <Info size={16} strokeWidth={1.5} aria-hidden="true" />,
  warning: (
    <AlertTriangle size={16} strokeWidth={1.5} aria-hidden="true" />
  ),
};

function ToastItem({ toast }: { toast: Toast }) {
  const remove = useToastStore((s) => s.remove);
  const duration = toast.duration ?? 4000;
  const [progress, setProgress] = useState(100);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number>(Date.now());
  const pausedRef = useRef(false);
  const remainingRef = useRef(duration);

  useEffect(() => {
    const tick = 50;

    const start = () => {
      startRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        if (pausedRef.current) return;
        const elapsed = Date.now() - startRef.current;
        const remaining = remainingRef.current - elapsed;
        const pct = Math.max((remaining / duration) * 100, 0);
        setProgress(pct);
        if (pct <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          remove(toast.id);
        }
      }, tick);
    };

    start();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [toast.id, duration, remove]);

  const pause = () => {
    pausedRef.current = true;
    remainingRef.current -= Date.now() - startRef.current;
  };
  const resume = () => {
    pausedRef.current = false;
    startRef.current = Date.now();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{
        opacity: 0,
        y: 8,
        scale: 0.97,
        transition: { duration: 0.2, ease: "easeIn" },
      }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={["toast", `toast--${toast.type}`].join(" ")}
      role={
        toast.type === "error" || toast.type === "warning"
          ? "alert"
          : "status"
      }
      aria-live={toast.type === "error" ? "assertive" : "polite"}
      aria-atomic="true"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
    >
      <div className="toast__body">
        <span className="toast__icon">{ICONS[toast.type]}</span>

        <div className="toast__text">
          <p className="toast__title">{toast.title}</p>
          {toast.message && (
            <p className="toast__message">{toast.message}</p>
          )}
          {toast.action && (
            <button
              type="button"
              className="toast__action"
              onClick={() => {
                toast.action?.onClick();
                remove(toast.id);
              }}
            >
              {toast.action.label}
            </button>
          )}
        </div>

        <button
          type="button"
          className="toast__dismiss"
          onClick={() => remove(toast.id)}
          aria-label="Dismiss notification"
        >
          <X size={14} strokeWidth={1.5} />
        </button>
      </div>

      <div className="toast__progress" aria-hidden="true">
        <div
          className="toast__progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
}

export default function ToastProvider() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div
      className="toast-region"
      aria-label="Notifications"
      aria-relevant="additions"
    >
      <AnimatePresence initial={false} mode="sync">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
