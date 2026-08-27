import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface HoverLiftProps {
  children: ReactNode;
  className?: string;
  lift?: number;
  glow?: boolean;
}

/** Wraps content with a subtle rise + glow on hover — the default
 * micro-interaction for cards, list rows, and feature tiles. */
export function HoverLift({ children, className, lift = 6, glow = true }: HoverLiftProps) {
  return (
    <motion.div
      className={cn("transition-shadow", className)}
      whileHover={{
        y: -lift,
        boxShadow: glow ? "0 20px 50px rgba(139,92,246,0.2)" : undefined,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      {children}
    </motion.div>
  );
}
