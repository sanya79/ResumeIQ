import { UserSearch, ThumbsUp, ThumbsDown, Info } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";
import { FadeIn } from "@/components/animations/FadeIn";
import { getEstimatedRankBand, isJobReady } from "../data";
import type { AtsScorecard } from "@/types";

interface RecruiterViewSectionProps {
  scorecard: AtsScorecard;
}

export function RecruiterViewSection({ scorecard }: RecruiterViewSectionProps) {
  const shortlist = isJobReady(scorecard.overallScore);
  const rankBand = getEstimatedRankBand(scorecard.overallScore);

  return (
    <FadeIn>
      <GlassCard className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UserSearch size={18} className="text-accent-purple" />
            <h3 className="text-fluid-base font-semibold">Recruiter Preview</h3>
          </div>
          <Tooltip content="Estimated from your ATS score band, not a real recruiter review">
            <span className="flex items-center gap-1 text-xs text-foreground-secondary">
              <Info size={12} /> Estimated
            </span>
          </Tooltip>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-foreground-secondary">Would a recruiter shortlist this?</span>
            <Badge tone={shortlist ? "emerald" : "pink"} className="w-fit text-sm">
              {shortlist ? "Likely yes" : "Likely no — needs work first"}
            </Badge>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-foreground-secondary">Expected ATS rank</span>
            <Badge tone="purple" className="w-fit text-sm">
              {rankBand}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-foreground-secondary">
              <ThumbsUp size={13} className="text-accent-emerald" /> Top strengths
            </div>
            {scorecard.strengths.length > 0 ? (
              <ul className="flex flex-col gap-1.5">
                {scorecard.strengths.slice(0, 3).map((s) => (
                  <li key={s.id} className="rounded-lg bg-accent-emerald/10 px-2.5 py-1.5 text-xs text-foreground">
                    {s.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-foreground-secondary">None flagged yet.</p>
            )}
          </div>
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-foreground-secondary">
              <ThumbsDown size={13} className="text-danger" /> Main concerns
            </div>
            {scorecard.weakAreas.length > 0 ? (
              <ul className="flex flex-col gap-1.5">
                {scorecard.weakAreas.slice(0, 3).map((w) => (
                  <li key={w.id} className="rounded-lg bg-danger/10 px-2.5 py-1.5 text-xs text-foreground">
                    {w.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-foreground-secondary">None flagged — clean scorecard.</p>
            )}
          </div>
        </div>
      </GlassCard>
    </FadeIn>
  );
}
