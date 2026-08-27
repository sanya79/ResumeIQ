import { UserSearch, ThumbsUp, ThumbsDown, Info, Clock3 } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Chip } from "@/components/ui/Chip";
import { Tooltip } from "@/components/ui/Tooltip";
import { FadeIn } from "@/components/animations/FadeIn";
import { AnimatedNumber } from "@/components/animations/AnimatedNumber";
import { useRecruiterSimulation } from "@/services/ats.api";
import { getEstimatedRankBand, isJobReady } from "../data";
import type { AtsScorecard } from "@/types";

interface RecruiterViewSectionProps {
  scorecard: AtsScorecard;
  resumeId?: string;
}

export function RecruiterViewSection({ scorecard, resumeId }: RecruiterViewSectionProps) {
  const shortlist = isJobReady(scorecard.overallScore);
  const rankBand = getEstimatedRankBand(scorecard.overallScore);
  const { data: simulation, isLoading, isError } = useRecruiterSimulation(resumeId);

  const displayStrengths = simulation?.strengths?.length ? simulation.strengths : scorecard.strengths;
  const displayWeaknesses = simulation?.weaknesses?.length ? simulation.weaknesses : scorecard.weakAreas;

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

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-foreground-secondary">First impression</p>
              <p className="text-lg font-semibold text-foreground">
                {isLoading ? "Simulating review..." : isError ? "Preview unavailable" : simulation?.firstImpression ?? "Strong first impression"}
              </p>
              <p className="text-sm text-foreground-secondary">
                {isLoading ? "Fetching recruiter-style feedback from the server…" : simulation?.explanationBullets?.[0] ?? "This estimate blends ATS quality with resume clarity signals."}
              </p>
            </div>
            <div className="rounded-2xl border border-accent-purple/20 bg-accent-purple/10 px-4 py-3 text-center">
              <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.24em] text-foreground-secondary">
                <Clock3 size={14} /> Read time
              </div>
              <div className="mt-1 text-2xl font-semibold text-foreground">
                {isLoading ? "—" : `${simulation?.estimatedReadTime ?? 45}s`}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-emerald/20 bg-emerald/10 px-3 py-1.5 text-sm font-medium text-emerald">
              <span>Hire probability</span>
              <AnimatedNumber value={isLoading ? 0 : simulation?.hireProbability ?? Math.round(scorecard.overallScore)} suffix="%" className="text-base font-semibold" />
            </div>
            <Badge tone="blue" className="text-xs">
              {isLoading ? "Reviewing" : isError ? "Fallback mode" : "Recruiter-style signal"}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-foreground-secondary">
              <ThumbsUp size={13} className="text-accent-emerald" /> Top strengths
            </div>
            {displayStrengths.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {displayStrengths.slice(0, 4).map((s) => (
                  <li key={s.id}>
                    <Chip className="bg-accent-emerald/10 border-accent-emerald/20 text-foreground">{s.name}</Chip>
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
            {displayWeaknesses.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {displayWeaknesses.slice(0, 4).map((w) => (
                  <li key={w.id}>
                    <Chip className="border-danger/20 bg-danger/10 text-foreground">{w.name}</Chip>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-foreground-secondary">None flagged — clean scorecard.</p>
            )}
          </div>
        </div>

        {simulation?.explanationBullets?.length ? (
          <ul className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            {simulation.explanationBullets.map((bullet) => (
              <li key={bullet} className="text-sm text-foreground-secondary">
                • {bullet}
              </li>
            ))}
          </ul>
        ) : null}
      </GlassCard>
    </FadeIn>
  );
}
