import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { useToastStore, type ToastVariant } from "@/stores/toastStore";
import { cn } from "@/utils/cn";

const variantConfig: Record<ToastVariant, { icon: typeof CheckCircle2; color: string }> = {
  success: { icon: CheckCircle2, color: "text-accent-emerald" },
  error: { icon: AlertCircle, color: "text-danger" },
  info: { icon: Info, color: "text-accent-cyan" },
  warning: { icon: AlertTriangle, color: "text-accent-pink" },
};

/**
 * Renders the live toast queue. Mount this once near the root (e.g. in
 * App.tsx) — individual components trigger toasts via the `useToast` hook.
 */
export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return createPortal(
    <div className="fixed bottom-6 right-6 z-[100] flex w-full max-w-sm flex-col gap-3">
      <AnimatePresence>
        {toasts.map((t) => {
          const { icon: Icon, color } = variantConfig[t.variant];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              role="status"
              className="glass-strong flex items-start gap-3 rounded-xl p-4 shadow-card"
            >
              <Icon size={18} className={cn("shrink-0 mt-0.5", color)} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{t.title}</p>
                {t.description && <p className="mt-0.5 text-xs text-foreground-secondary">{t.description}</p>}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="shrink-0 text-foreground-secondary hover:text-foreground"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body
  );
}
