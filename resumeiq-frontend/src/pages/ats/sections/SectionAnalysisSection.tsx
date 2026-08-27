import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import { SectionInsightCard } from "../components/SectionInsightCard";
import type { AtsScorecard } from "@/types";

interface SectionAnalysisSectionProps {
  scorecard: AtsScorecard;
}

/**
 * The real backend scores by ATS rule category (keyword relevance,
 * formatting, experience quality, etc.) rather than by literal resume
 * section names — so "section analysis" here means those real scoring
 * categories, enriched with any strengths/weakAreas the engine flagged for
 * the same category (matched by id, falling back to name).
 */
export function SectionAnalysisSection({ scorecard }: SectionAnalysisSectionProps) {
  return (
    <StaggerChildren>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {scorecard.breakdown.map((item) => {
          const matchedStrength = scorecard.strengths.find((s) => s.id === item.id || s.name === item.name);
          const matchedWeakness = scorecard.weakAreas.find((w) => w.id === item.id || w.name === item.name);
          return (
            <StaggerItem key={item.id}>
              <SectionInsightCard item={item} matchedStrength={matchedStrength} matchedWeakness={matchedWeakness} />
            </StaggerItem>
          );
        })}
      </div>
    </StaggerChildren>
  );
}
