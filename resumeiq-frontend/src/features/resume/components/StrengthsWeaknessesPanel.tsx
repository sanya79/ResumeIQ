import { ThumbsUp, ThumbsDown } from "lucide-react";
import { AnalyticsCard } from "@/components/cards/AnalyticsCard";
import { Badge } from "@/components/ui/Badge";
import type { AtsStrengthOrWeakness } from "@/types";

interface StrengthsWeaknessesPanelProps {
  strengths: AtsStrengthOrWeakness[];
  weakAreas: AtsStrengthOrWeakness[];
}

export function StrengthsWeaknessesPanel({ strengths, weakAreas }: StrengthsWeaknessesPanelProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <AnalyticsCard title="Resume Strengths" actions={<ThumbsUp size={16} className="text-accent-emerald" />}>
        {strengths.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {strengths.map((s) => (
              <li key={s.id} className="flex items-start gap-2 text-sm">
                <Badge tone="emerald" className="mt-0.5 shrink-0">
                  {s.name}
                </Badge>
                <span className="text-foreground-secondary">{s.message}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-foreground-secondary">No standout categories yet — every section has room to grow.</p>
        )}
      </AnalyticsCard>

      <AnalyticsCard title="Weak Areas" actions={<ThumbsDown size={16} className="text-danger" />}>
        {weakAreas.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {weakAreas.map((w) => (
              <li key={w.id} className="flex items-start gap-2 text-sm">
                <Badge tone="danger" className="mt-0.5 shrink-0">
                  {w.name}
                </Badge>
                <span className="text-foreground-secondary">{w.message}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-foreground-secondary">No significant weak areas detected. Nice work.</p>
        )}
      </AnalyticsCard>
    </div>
  );
}
