import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { GlassCard } from "@/components/cards/GlassCard";
import { cn } from "@/utils/cn";

interface AuthCardProps {
  children: ReactNode;
  className?: string;
}

/** Shared entry animation + glass surface for every auth screen — the one
 * place that owns "what an auth card looks like" so Login/Register/Forgot/
 * Reset never redefine it themselves. */
export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassCard strong glow className={cn("w-full p-8 shadow-card", className)}>
        {children}
      </GlassCard>
    </motion.div>
  );
}
