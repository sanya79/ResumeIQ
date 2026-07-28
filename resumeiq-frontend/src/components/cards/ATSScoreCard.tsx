import { GlassCard } from "./GlassCard";
import { ScoreRing } from "@/components/charts/ScoreRing";
import { MetricCard } from "./MetricCard";
import type { AtsScorecard } from "@/types";

interface ATSScoreCardProps {
  result: AtsScorecard;
}

/**
 * ResumeIQ's signature ATS verdict card: overall ScoreRing + a per-metric
 * breakdown + AI suggestions. Composed entirely from the primitives above
 * (GlassCard, ScoreRing, MetricCard) — no bespoke markup of its own.
 *
 * `breakdown` is the real ATS engine's array of scored rules (up to 10 —
 * section completeness, keyword relevance, experience quality, etc.),
 * not a fixed 4-field object, so each item is rendered as its own
 * MetricCard scaled to a 0-100 value.
 */
export function ATSScoreCard({ result }: ATSScoreCardProps) {
  return (
    <GlassCard glow className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-fluid-lg font-semibold">ATS Compatibility Score</h3>
          <p className="mt-1 text-sm text-foreground-secondary">
            How well this resume is likely to pass automated screening.
          </p>
        </div>
        <ScoreRing score={result.overallScore} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {result.breakdown.map((item) => (
          <MetricCard
            key={item.id}
            label={item.name}
            value={item.maxScore > 0 ? Math.round((item.score / item.maxScore) * 100) : 0}
            description={item.reason}
          />
        ))}
      </div>

      {result.top10Improvements.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-foreground-secondary">Top Suggestions</h4>
          <ul className="flex flex-col gap-2">
            {result.top10Improvements.map((s, i) => (
              <li key={i} className="rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-foreground">
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </GlassCard>
  );
}
