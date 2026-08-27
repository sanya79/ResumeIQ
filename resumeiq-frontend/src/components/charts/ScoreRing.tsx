import { ProgressCircle } from "./ProgressCircle";
import { cn } from "@/utils/cn";

interface ScoreRingProps {
  score: number; // 0-100
  size?: number;
  label?: string;
}

/** Tints the ring red→amber→green by score band, with the number centered.
 * This is ResumeIQ's signature "AI verdict" visual — used for ATS score,
 * match score, etc. wherever a single 0-100 number needs a verdict at a glance. */
export function ScoreRing({ score, size = 120, label }: ScoreRingProps) {
  const color = score >= 80 ? "#10B981" : score >= 50 ? "#22D3EE" : "#EC4899";

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <ProgressCircle value={score} size={size} strokeWidth={10} color={color}>
        <div className="flex flex-col items-center">
          <span className={cn("font-bold tabular-nums", size >= 100 ? "text-fluid-2xl" : "text-fluid-lg")}>
            {Math.round(score)}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-foreground-secondary">/ 100</span>
        </div>
      </ProgressCircle>
      {label && <span className="text-sm text-foreground-secondary">{label}</span>}
    </div>
  );
}
