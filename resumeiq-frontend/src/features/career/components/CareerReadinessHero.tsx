import { Clock, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { ProgressCircle } from "@/components/charts/ProgressCircle";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { FadeIn } from "@/components/animations/FadeIn";
import { getReadinessColor, getReadinessTone } from "@/pages/career/data";
import type { CareerReadinessStatus } from "@/types";

interface CareerReadinessHeroProps {
  targetRole: string;
  careerReadinessScore: number;
  readinessStatus: CareerReadinessStatus;
  estimatedTimeToTarget: string;
}

/** Top hero: page title + the large animated circular Career Readiness
 * score. Combines the spec's "TOP HERO" and "CAREER READINESS SCORE"
 * sections into one visual block since they always render together. */
export function CareerReadinessHero({
  targetRole,
  careerReadinessScore,
  readinessStatus,
  estimatedTimeToTarget,
}: CareerReadinessHeroProps) {
  const color = getReadinessColor(readinessStatus);

  return (
    <FadeIn className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-foreground-secondary">
          <Sparkles size={13} className="text-accent-cyan" />
          AI Career Growth
        </div>
        <h1 className="text-fluid-2xl font-extrabold tracking-tight">
          <span className="text-gradient">Career Growth</span> Dashboard
        </h1>
        <p className="max-w-xl text-sm text-foreground-secondary sm:text-base">
          Understand your strengths and build a personalized roadmap to your dream role.
        </p>
      </div>

      <GlassCard glow className="flex flex-col items-center gap-6 p-8 sm:flex-row sm:justify-between">
        <div className="flex flex-col items-center gap-3 sm:items-start">
          <span className="text-xs font-medium uppercase tracking-wider text-foreground-secondary">
            Target Role
          </span>
          <span className="text-fluid-lg font-semibold text-foreground">{targetRole}</span>
          <div className="flex items-center gap-1.5 text-sm text-foreground-secondary">
            <Clock size={14} className="text-accent-cyan" />
            Estimated time to target: <span className="font-medium text-foreground">{estimatedTimeToTarget}</span>
          </div>
          <Badge tone={getReadinessTone(readinessStatus)}>{readinessStatus}</Badge>
        </div>

        <ProgressCircle value={careerReadinessScore} size={160} strokeWidth={12} color={color}>
          <div className="flex flex-col items-center">
            <span className="text-fluid-2xl font-bold tabular-nums">
              <AnimatedNumber value={Math.round(careerReadinessScore)} suffix="%" />
            </span>
            <span className="text-[11px] uppercase tracking-wider text-foreground-secondary">Career Readiness</span>
          </div>
        </ProgressCircle>
      </GlassCard>
    </FadeIn>
  );
}
