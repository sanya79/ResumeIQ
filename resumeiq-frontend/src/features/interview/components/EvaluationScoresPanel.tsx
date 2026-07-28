import { AnalyticsCard } from "@/components/cards/AnalyticsCard";
import { MetricCard } from "@/components/cards/MetricCard";
import { ScoreRing } from "@/components/charts/ScoreRing";
import type { AnswerEvaluation } from "@/types";

const scoreFields: { key: keyof AnswerEvaluation; label: string }[] = [
  { key: "communicationScore", label: "Communication" },
  { key: "technicalAccuracy", label: "Technical Accuracy" },
  { key: "confidenceScore", label: "Confidence" },
  { key: "clarity", label: "Clarity" },
  { key: "problemSolving", label: "Problem Solving" },
  { key: "grammar", label: "Grammar" },
  { key: "completeness", label: "Completeness" },
];

export function EvaluationScoresPanel({ evaluation }: { evaluation: AnswerEvaluation }) {
  return (
    <AnalyticsCard title="Answer Evaluation" subtitle="How this answer scored across every dimension">
      <div className="flex flex-col items-center gap-4 border-b border-surface-border pb-5 sm:flex-row sm:items-start">
        <ScoreRing score={Math.round(evaluation.overallRating)} size={100} />
        <div>
          <p className="text-sm font-medium text-foreground-secondary">Overall Rating</p>
          <p className="text-fluid-xl font-bold">{Math.round(evaluation.overallRating)}/100</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {scoreFields.map(({ key, label }) => (
          <MetricCard key={key} label={label} value={Math.round(evaluation[key] as number)} />
        ))}
      </div>
    </AnalyticsCard>
  );
}
