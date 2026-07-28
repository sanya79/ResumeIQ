import { Sparkles } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { TimelineCard, type TimelineStep } from "@/components/cards/TimelineCard";
import { FadeIn } from "@/components/animations/FadeIn";
import { careerPipelineSteps, type CareerPipelineStepId, type CareerStepStatus } from "../useCareerPipeline";

interface CareerProcessingTimelineProps {
  statuses: Record<CareerPipelineStepId, CareerStepStatus>;
}

/** Same shell as the Job Matching Engine's `ProcessingTimeline` — reuses
 * `GlassCard`/`TimelineCard`/`FadeIn` directly, just fed this feature's
 * own pipeline steps. */
export function CareerProcessingTimeline({ statuses }: CareerProcessingTimelineProps) {
  const statusMap: Record<CareerStepStatus, TimelineStep["status"]> = {
    pending: "upcoming",
    active: "current",
    complete: "complete",
  };

  const steps: TimelineStep[] = careerPipelineSteps.map((step) => ({
    title: step.label,
    status: statusMap[statuses[step.id]],
  }));

  return (
    <FadeIn>
      <GlassCard glow className="mx-auto flex max-w-lg flex-col items-center gap-6 p-10 text-center">
        <div className="relative">
          <span className="absolute inset-0 -z-10 animate-pulse-glow rounded-full bg-gradient-primary blur-2xl opacity-50" />
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary text-white shadow-glow">
            <Sparkles size={26} className="animate-pulse" />
          </div>
        </div>
        <div>
          <h2 className="text-fluid-lg font-semibold">AI is building your career roadmap</h2>
          <p className="mt-1 text-sm text-foreground-secondary">This usually takes a few seconds.</p>
        </div>
        <div className="w-full text-left">
          <TimelineCard steps={steps} />
        </div>
      </GlassCard>
    </FadeIn>
  );
}
