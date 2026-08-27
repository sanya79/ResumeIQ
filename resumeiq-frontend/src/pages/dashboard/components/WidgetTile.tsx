import { type ReactNode, memo } from "react";
import { GlassCard } from "@/components/cards/GlassCard";
import { cn } from "@/utils/cn";

interface WidgetTileProps {
  icon: ReactNode;
  label: string;
  accent?: "purple" | "cyan" | "pink" | "emerald";
  children: ReactNode;
  className?: string;
}

const accentMap: Record<NonNullable<WidgetTileProps["accent"]>, string> = {
  purple: "text-accent-purple",
  cyan: "text-accent-cyan",
  pink: "text-accent-pink",
  emerald: "text-accent-emerald",
};

/** Compact "weather-widget" style tile for the dashboard right rail —
 * small glass card with an icon eyebrow and short body content. */
export const WidgetTile = memo(function WidgetTile({ icon, label, accent = "purple", children, className }: WidgetTileProps) {
  return (
    <GlassCard className={cn("flex flex-col gap-2.5", className)}>
      <div className={cn("flex items-center gap-2 text-xs font-medium uppercase tracking-wide", accentMap[accent])}>
        {icon}
        {label}
      </div>
      <div className="text-sm leading-relaxed text-foreground">{children}</div>
    </GlassCard>
  );
});
