import { type ReactNode } from "react";
import { GlassCard } from "./GlassCard";
import { ProgressBar } from "@/components/charts/ProgressBar";

interface MetricCardProps {
  label: string;
  value: number; // 0-100, rendered as a labeled progress bar
  icon?: ReactNode;
  description?: string;
}

/** Single scored metric with context — e.g. one row of an ATS score
 * breakdown (Keyword Match, Formatting, Readability...). */
export function MetricCard({ label, value, icon, description }: MetricCardProps) {
  return (
    <GlassCard className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        {icon && <span className="text-accent-cyan">{icon}</span>}
        {label}
      </div>
      <ProgressBar value={value} />
      {description && <p className="text-xs text-foreground-secondary">{description}</p>}
    </GlassCard>
  );
}
