import { create } from "zustand";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastState {
  toasts: ToastItem[];
  push: (toast: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
}

/** Backing store for the app-wide toast queue. Prefer the `useToast` hook
 * over consuming this store directly in components. */
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) =>
    set((s) => {
      // Prevent exact duplicate notifications from stacking up
      const isDuplicate = s.toasts.some(
        (t) => t.title === toast.title && t.description === toast.description
      );
      if (isDuplicate) return s;

      const newItem: ToastItem = { ...toast, id: crypto.randomUUID() };
      // Keep max 3 toasts visible at a time
      return { toasts: [...s.toasts, newItem].slice(-3) };
    }),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

