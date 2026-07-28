import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  distance?: number;
  delay?: number;
}

/** Gentle infinite vertical drift — used for hero visuals and floating cards. */
export function FloatingElement({
  children,
  className,
  duration = 5,
  distance = 12,
  delay = 0,
}: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -distance, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}
