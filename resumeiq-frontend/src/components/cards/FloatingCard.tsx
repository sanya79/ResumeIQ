import { type ReactNode } from "react";
import { GlassCard } from "./GlassCard";
import { FloatingElement } from "@/components/animations/FloatingElement";

interface FloatingCardProps {
  children: ReactNode;
  duration?: number;
  delay?: number;
  className?: string;
}

/** A GlassCard with a continuous gentle float — for hero illustrations and
 * decorative product-preview panels, not for dense content grids. */
export function FloatingCard({ children, duration = 5, delay = 0, className }: FloatingCardProps) {
  return (
    <FloatingElement duration={duration} delay={delay}>
      <GlassCard glow className={className}>
        {children}
      </GlassCard>
    </FloatingElement>
  );
}
