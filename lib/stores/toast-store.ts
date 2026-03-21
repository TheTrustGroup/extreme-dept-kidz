import { create } from "zustand";

// ─── Types ────────────────────────────────────────────────────────
export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastStore {
  toasts: Toast[];
  add: (toast: Omit<Toast, "id">) => string;
  remove: (id: string) => void;
  clear: () => void;
  success: (
    title: string,
    message?: string,
    opts?: Partial<Toast>
  ) => string;
  error: (
    title: string,
    message?: string,
    opts?: Partial<Toast>
  ) => string;
  info: (
    title: string,
    message?: string,
    opts?: Partial<Toast>
  ) => string;
  warning: (
    title: string,
    message?: string,
    opts?: Partial<Toast>
  ) => string;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  add: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((s) => ({
      toasts: [...s.toasts.slice(-2), { ...toast, id }],
    }));
    return id;
  },

  remove: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  clear: () => set({ toasts: [] }),

  success: (title, message, opts) =>
    get().add({ type: "success", title, message, duration: 4000, ...opts }),

  error: (title, message, opts) =>
    get().add({ type: "error", title, message, duration: 6000, ...opts }),

  info: (title, message, opts) =>
    get().add({ type: "info", title, message, duration: 4000, ...opts }),

  warning: (title, message, opts) =>
    get().add({ type: "warning", title, message, duration: 5000, ...opts }),
}));

export function useToast() {
  return useToastStore((s) => ({
    success: s.success,
    error: s.error,
    info: s.info,
    warning: s.warning,
    remove: s.remove,
    clear: s.clear,
  }));
}
