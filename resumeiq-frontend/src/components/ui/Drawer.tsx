import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  side?: "right" | "left";
  children: ReactNode;
  className?: string;
}

/** Slide-in side panel — for filters, detail views, and secondary flows
 * that don't warrant a full route change. */
export function Drawer({ open, onClose, title, side = "right", children, className }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ x: side === "right" ? "100%" : "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: side === "right" ? "100%" : "-100%" }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "relative ml-auto h-full w-full max-w-md glass-strong p-6 overflow-y-auto",
              side === "left" && "mr-auto ml-0",
              className
            )}
          >
            {title && (
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-fluid-lg font-semibold">{title}</h2>
                <button
                  onClick={onClose}
                  aria-label="Close panel"
                  className="rounded-lg p-1.5 text-foreground-secondary hover:text-foreground hover:bg-white/[0.06] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
