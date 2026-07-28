import { Sparkles } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { ProgressCircle } from "@/components/charts/ProgressCircle";
import { Badge } from "@/components/ui/Badge";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { FadeIn } from "@/components/animations/FadeIn";
import { getMatchTier, getMatchTierColor, getMatchTierTone } from "@/pages/matching/data";
import type { MatchResult } from "@/types";

interface MatchScoreHeroProps {
  match: MatchResult;
  jobTitle: string;
  company: string;
}

export function MatchScoreHero({ match, jobTitle, company }: MatchScoreHeroProps) {
  const tier = getMatchTier(match.matchScore);

  return (
    <FadeIn>
      <GlassCard glow className="flex flex-col items-center gap-6 p-10 text-center sm:flex-row sm:text-left">
        <div className="relative shrink-0">
          <ProgressCircle value={match.matchScore} size={176} strokeWidth={13} color={getMatchTierColor(match.matchScore)}>
            <div className="flex flex-col items-center">
              <span className="text-xs uppercase tracking-wider text-foreground-secondary">Job Match</span>
              <span className="text-fluid-4xl font-[900] tabular-nums">
                <AnimatedNumber value={Math.round(match.matchScore)} suffix="%" />
              </span>
            </div>
          </ProgressCircle>
        </div>

        <div className="flex flex-col items-center gap-3 sm:items-start">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-foreground-secondary">
            <Sparkles size={13} className="text-accent-cyan" />
            AI Match Result
          </div>
          <h1 className="text-fluid-3xl font-extrabold tracking-tight">
            <span className="text-gradient">{tier}</span>
          </h1>
          <p className="max-w-md text-sm text-foreground-secondary">
            {jobTitle || match.jobTitle || "This role"}
            {(company || match.company) && ` at ${company || match.company}`}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <Badge tone={getMatchTierTone(match.matchScore)}>{tier}</Badge>
            <Badge tone="neutral">{Math.round(match.confidence * 100)}% confidence</Badge>
            <Badge tone="purple">{match.matchedKeywords.length} matched keywords</Badge>
          </div>
        </div>
      </GlassCard>
    </FadeIn>
  );
}
