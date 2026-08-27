import { type ReactNode } from "react";
import { GlassCard } from "./GlassCard";
import { HoverLift } from "@/components/animations/HoverLift";
import { SlideUp } from "@/components/animations/SlideUp";
import { cn } from "@/utils/cn";

interface AnimatedCardProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/** GlassCard pre-wired with an entrance animation and a hover-lift
 * micro-interaction — the default card for grids of feature/stat tiles. */
export function AnimatedCard({ children, delay = 0, className }: AnimatedCardProps) {
  return (
    <SlideUp delay={delay}>
      <HoverLift>
        <GlassCard className={cn("h-full", className)}>{children}</GlassCard>
      </HoverLift>
    </SlideUp>
  );
}
