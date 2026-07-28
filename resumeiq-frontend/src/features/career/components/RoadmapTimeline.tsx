import { motion } from "framer-motion";
import { Check, Circle, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/charts/ProgressBar";
import { getDifficultyTone, getPriorityTone, getRoadmapProgress } from "@/pages/career/data";
import { cn } from "@/utils/cn";
import type { RoadmapStep } from "@/types";

const statusDot: Record<RoadmapStep["status"], string> = {
  completed: "bg-accent-emerald border-accent-emerald",
  "in-progress": "bg-accent-purple border-accent-purple animate-pulse-glow",
  "not-started": "bg-transparent border-surface-border",
};

interface RoadmapTimelineProps {
  steps: RoadmapStep[];
  onToggleStep: (step: RoadmapStep) => void;
  pendingStepId?: string;
}

/** Vertical roadmap — same dot/connector visual grammar as `TimelineCard`,
 * extended with the duration/difficulty/priority badges and a completion
 * toggle the spec calls for, since `TimelineCard` itself only carries a
 * title/description/status. */
export function RoadmapTimeline({ steps, onToggleStep, pendingStepId }: RoadmapTimelineProps) {
  const progress = getRoadmapProgress(steps);

  return (
    <GlassCard className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Roadmap Progress</h3>
          <p className="text-xs text-foreground-secondary">
            {progress.completed} of {progress.total} steps completed
          </p>
        </div>
        <span className="text-fluid-base font-bold text-accent-emerald">{progress.percent}%</span>
      </div>
      <ProgressBar value={progress.percent} />

      <ol className="flex flex-col">
        {steps
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((step, i, arr) => {
            const isPending = pendingStepId === step.id;
            return (
              <motion.li
                key={step.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex gap-4 pb-8 last:pb-0"
              >
                {i < arr.length - 1 && (
                  <span className="absolute left-[11px] top-6 h-full w-px bg-surface-border" aria-hidden />
                )}

                <button
                  type="button"
                  onClick={() => onToggleStep(step)}
                  disabled={isPending}
                  aria-label={step.status === "completed" ? "Mark step incomplete" : "Mark step complete"}
                  className={cn(
                    "relative z-10 mt-1 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    statusDot[step.status]
                  )}
                >
                  {isPending ? (
                    <Loader2 size={12} className="animate-spin text-white" />
                  ) : step.status === "completed" ? (
                    <Check size={12} className="text-white" />
                  ) : step.status === "in-progress" ? null : (
                    <Circle size={6} className="text-surface-border" />
                  )}
                </button>

                <div className="min-w-0 flex-1 rounded-xl bg-white/[0.03] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">
                      Step {step.order} &middot; {step.title}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge tone={getPriorityTone(step.priority)}>{step.priority} Priority</Badge>
                      <Badge tone={getDifficultyTone(step.difficulty)}>{step.difficulty}</Badge>
                    </div>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-foreground-secondary">{step.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-foreground-secondary">
                    <span>
                      Duration: <span className="font-medium text-foreground">{step.estimatedDuration}</span>
                    </span>
                    <span className="capitalize">
                      Status: <span className="font-medium text-foreground">{step.status.replace("-", " ")}</span>
                    </span>
                  </div>
                  {step.skillsCovered.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {step.skillsCovered.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-surface-border bg-white/[0.04] px-2 py-0.5 text-[11px] text-foreground-secondary"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.li>
            );
          })}
      </ol>
    </GlassCard>
  );
}
