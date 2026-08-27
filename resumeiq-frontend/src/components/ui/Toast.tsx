import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { useToastStore, type ToastItem, type ToastVariant } from "@/stores/toastStore";
import { cn } from "@/utils/cn";

const variantConfig: Record<ToastVariant, { icon: typeof CheckCircle2; color: string }> = {
  success: { icon: CheckCircle2, color: "text-accent-emerald" },
  error: { icon: AlertCircle, color: "text-danger" },
  info: { icon: Info, color: "text-accent-cyan" },
  warning: { icon: AlertTriangle, color: "text-accent-pink" },
};

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const { icon: Icon, color } = variantConfig[toast.variant];
  const [isHovered, setIsHovered] = useState(false);
  const duration = toast.duration ?? 4000;

  useEffect(() => {
    if (duration <= 0 || isHovered) return;

    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, duration, isHovered, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      role="status"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="glass-strong flex items-start gap-3 rounded-xl p-4 shadow-card no-print"
    >
      <Icon size={18} className={cn("shrink-0 mt-0.5", color)} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{toast.title}</p>
        {toast.description && <p className="mt-0.5 text-xs text-foreground-secondary">{toast.description}</p>}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="shrink-0 text-foreground-secondary hover:text-foreground"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

/**
 * Renders the live toast queue. Mount this once near the root (e.g. in
 * App.tsx) — individual components trigger toasts via the `useToast` hook.
 */
export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return createPortal(
    <div className="fixed bottom-6 right-6 z-[100] flex w-full max-w-sm flex-col gap-3 pointer-events-auto">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}

