import { type ReactNode, useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface TooltipProps {
  content: string;
  children: ReactNode;
  side?: "top" | "bottom";
}

/** Lightweight hover/focus tooltip — CSS-positioned (no portal), wired
 * with aria-describedby so it's announced by screen readers too. */
export function Tooltip({ content, children, side = "top" }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span aria-describedby={id}>{children}</span>
      <AnimatePresence>
        {open && (
          <motion.span
            id={id}
            role="tooltip"
            initial={{ opacity: 0, y: side === "top" ? 4 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: side === "top" ? 4 : -4 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg glass-strong px-2.5 py-1.5 text-xs text-foreground shadow-card",
              side === "top" ? "bottom-full mb-2" : "top-full mt-2"
            )}
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
