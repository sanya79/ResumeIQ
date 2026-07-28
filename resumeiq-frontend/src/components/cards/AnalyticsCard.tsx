import { type ReactNode } from "react";
import { GlassCard } from "./GlassCard";

interface AnalyticsCardProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/** Generic chart/analytics container — provides the consistent header
 * (title + subtitle + actions slot) that wraps any chart content passed
 * as children, so chart libraries stay decoupled from this shell. */
export function AnalyticsCard({ title, subtitle, actions, children }: AnalyticsCardProps) {
  return (
    <GlassCard>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-fluid-base font-semibold">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-foreground-secondary">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </GlassCard>
  );
}
