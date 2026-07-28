import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface MarqueeProps {
  children: ReactNode[];
  duration?: number;
  className?: string;
  reverse?: boolean;
}

/**
 * Infinite horizontal scroller. Renders the children twice back-to-back and
 * animates the track by exactly -50%, so the loop point is seamless — used
 * for both the trusted-by logo strip and the testimonials rail.
 */
export function Marquee({ children, duration = 30, className, reverse = false }: MarqueeProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
      <motion.div
        className="flex w-max gap-8"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}
