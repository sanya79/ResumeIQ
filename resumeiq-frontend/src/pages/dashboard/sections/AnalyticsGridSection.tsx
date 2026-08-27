import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import { ScoreCard } from "../components/ScoreCard";
import type { ScoreCardDatum } from "../data";

/** The four hero KPI cards: ATS Score, Resume Health, Job Match, Interview
 * Ready — each reveals on a stagger so they don't all pop in at once. */
export function AnalyticsGridSection({
  data,
  isLoading,
}: {
  data?: { scoreCards?: ScoreCardDatum[] };
  isLoading?: boolean;
}) {
  const scoreCards = data?.scoreCards ?? [];

  if (isLoading && scoreCards.length === 0) {
    return null;
  }

  return (
    <StaggerChildren className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {scoreCards.map((datum) => (
        <StaggerItem key={datum.id} className="h-full">
          <ScoreCard datum={datum} />
        </StaggerItem>
      ))}
    </StaggerChildren>
  );
}
