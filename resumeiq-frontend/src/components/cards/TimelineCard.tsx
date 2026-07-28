import { type ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface TimelineStep {
  title: string;
  description?: string;
  icon?: ReactNode;
  status: "complete" | "current" | "upcoming";
}

interface TimelineCardProps {
  steps: TimelineStep[];
}

const statusDot: Record<TimelineStep["status"], string> = {
  complete: "bg-accent-emerald border-accent-emerald",
  current: "bg-accent-purple border-accent-purple animate-pulse-glow",
  upcoming: "bg-transparent border-surface-border",
};

/** Vertical step tracker — for interview stages, application pipeline,
 * resume-processing status, etc. */
export function TimelineCard({ steps }: TimelineCardProps) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, i) => (
        <li key={step.title} className="relative flex gap-4 pb-8 last:pb-0">
          {i < steps.length - 1 && (
            <span className="absolute left-[9px] top-5 h-full w-px bg-surface-border" aria-hidden />
          )}
          <span
            className={cn("relative z-10 mt-1 h-[18px] w-[18px] shrink-0 rounded-full border-2", statusDot[step.status])}
          />
          <div className="min-w-0">
            <p
              className={cn(
                "text-sm font-medium",
                step.status === "upcoming" ? "text-foreground-secondary" : "text-foreground"
              )}
            >
              {step.title}
            </p>
            {step.description && <p className="mt-0.5 text-xs text-foreground-secondary">{step.description}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
