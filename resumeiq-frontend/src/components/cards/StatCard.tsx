import { type ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { cn } from "@/utils/cn";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: { value: number; direction: "up" | "down" };
}

/** Compact KPI tile — for dashboard summary rows (resumes parsed, avg ATS
 * score, active matches, etc). */
export function StatCard({ label, value, icon, trend }: StatCardProps) {
  return (
    <GlassCard className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground-secondary">{label}</span>
        {icon && <span className="text-accent-purple">{icon}</span>}
      </div>
      <div className="flex items-end justify-between">
        <span className="text-fluid-2xl font-bold tabular-nums">{value}</span>
        {trend && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              trend.direction === "up" ? "text-accent-emerald" : "text-danger"
            )}
          >
            {trend.direction === "up" ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {trend.value}%
          </span>
        )}
      </div>
    </GlassCard>
  );
}
