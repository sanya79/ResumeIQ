import { Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { ProgressCircle } from "@/components/charts/ProgressCircle";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { Badge } from "@/components/ui/Badge";
import { FadeIn } from "@/components/animations/FadeIn";
import { getEstimatedRankBand, getScoreTier, isJobReady } from "../data";
import type { AtsScorecard } from "@/types";

interface ScoreHeroSectionProps {
  scorecard: AtsScorecard;
  previousScore?: number | null;
}

const ringColor = (score: number) => (score >= 80 ? "#10B981" : score >= 50 ? "#22D3EE" : "#EC4899");

export function ScoreHeroSection({ scorecard, previousScore }: ScoreHeroSectionProps) {
  const tier = getScoreTier(scorecard.overallScore);
  const rankBand = getEstimatedRankBand(scorecard.overallScore);
  const jobReady = isJobReady(scorecard.overallScore);
  const delta = previousScore != null ? scorecard.overallScore - previousScore : null;

  return (
    <FadeIn>
      <GlassCard glow className="flex flex-col items-center gap-6 p-10 text-center sm:flex-row sm:text-left">
        <div className="relative shrink-0">
          <ProgressCircle value={scorecard.overallScore} size={168} strokeWidth={12} color={ringColor(scorecard.overallScore)}>
            <div className="flex flex-col items-center">
              <span className="text-fluid-4xl font-[900] tabular-nums">
                <AnimatedNumber value={Math.round(scorecard.overallScore)} />
              </span>
              <span className="text-xs uppercase tracking-wider text-foreground-secondary">/ 100</span>
            </div>
          </ProgressCircle>
          {delta !== null && delta !== 0 && (
            <span
              className={
                "absolute -right-2 -top-2 flex items-center gap-1 rounded-full glass-strong px-2.5 py-1 text-xs font-medium " +
                (delta > 0 ? "text-accent-emerald" : "text-danger")
              }
            >
              {delta > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {delta > 0 ? "+" : ""}
              {delta}
            </span>
          )}
        </div>

        <div className="flex flex-col items-center gap-3 sm:items-start">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-foreground-secondary">
            <Sparkles size={13} className="text-accent-cyan" />
            ATS Score
          </div>
          <h1 className="text-fluid-3xl font-extrabold tracking-tight">
            {tier} <span className="text-gradient">resume</span>
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <Badge tone={jobReady ? "emerald" : "pink"}>{jobReady ? "Job Ready" : "Needs Work"}</Badge>
            <Badge tone="purple">{rankBand}</Badge>
            <Badge tone="neutral">{Math.round(scorecard.confidence * 100)}% confidence</Badge>
          </div>
          <p className="max-w-md text-sm text-foreground-secondary">
            Estimated score with recommended fixes applied:{" "}
            <span className="font-medium text-foreground">{Math.round(scorecard.estimatedImprovedScore)}/100</span>.
          </p>
        </div>
      </GlassCard>
    </FadeIn>
  );
}
