import { ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { AnalyticsCard } from "@/components/cards/AnalyticsCard";
import { ScoreRing } from "@/components/charts/ScoreRing";
import { EmptyState } from "@/components/ui/EmptyState";
import { SlideRight } from "@/components/animations/SlideRight";
import { SlideLeft } from "@/components/animations/SlideLeft";
import { getBreakdownTrend } from "../data";
import type { Resume } from "@/types";

interface ComparisonViewSectionProps {
  previous: Resume | null;
  current: Resume | null;
}

export function ComparisonViewSection({ previous, current }: ComparisonViewSectionProps) {
  if (!previous || !current || !previous.atsScorecard || !current.atsScorecard) {
    return (
      <EmptyState
        title="Nothing to compare yet"
        description="Once you've analyzed two or more versions of your resume, they'll be compared here."
      />
    );
  }

  const prevCard = previous.atsScorecard;
  const currCard = current.atsScorecard;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-[1fr_auto_1fr]">
        <SlideRight>
          <GlassCard className="flex flex-col items-center gap-3 text-center">
            <span className="text-xs font-medium uppercase tracking-wider text-foreground-secondary">
              Before · v{previous.version}
            </span>
            <ScoreRing score={prevCard.overallScore} size={110} />
          </GlassCard>
        </SlideRight>

        <ArrowRight size={20} className="mx-auto hidden text-foreground-secondary sm:block" />

        <SlideLeft>
          <GlassCard glow className="flex flex-col items-center gap-3 text-center">
            <span className="text-xs font-medium uppercase tracking-wider text-foreground-secondary">
              After · v{current.version}
            </span>
            <ScoreRing score={currCard.overallScore} size={110} />
          </GlassCard>
        </SlideLeft>
      </div>

      <AnalyticsCard title="What changed, category by category">
        <div className="flex flex-col divide-y divide-surface-border">
          {currCard.breakdown.map((item) => {
            const trend = getBreakdownTrend(item, prevCard);
            const Icon = trend.direction === "up" ? TrendingUp : trend.direction === "down" ? TrendingDown : Minus;
            const color =
              trend.direction === "up" ? "text-accent-emerald" : trend.direction === "down" ? "text-danger" : "text-foreground-secondary";
            return (
              <div key={item.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="text-foreground">{item.name}</span>
                <span className={`flex items-center gap-1 font-medium tabular-nums ${color}`}>
                  <Icon size={14} />
                  {trend.delta === null ? "New" : `${trend.delta > 0 ? "+" : ""}${trend.delta}`}
                </span>
              </div>
            );
          })}
        </div>
      </AnalyticsCard>
    </div>
  );
}
