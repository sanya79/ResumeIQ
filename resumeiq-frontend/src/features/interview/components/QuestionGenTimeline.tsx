import { Sparkles } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { TimelineCard, type TimelineStep } from "@/components/cards/TimelineCard";
import { FadeIn } from "@/components/animations/FadeIn";
import { questionGenSteps, type QuestionGenStepId, type GenStepStatus } from "../useQuestionGenPipeline";

interface QuestionGenTimelineProps {
  statuses: Record<QuestionGenStepId, GenStepStatus>;
}

export function QuestionGenTimeline({ statuses }: QuestionGenTimelineProps) {
  const statusMap: Record<GenStepStatus, TimelineStep["status"]> = {
    pending: "upcoming",
    active: "current",
    complete: "complete",
  };

  const steps: TimelineStep[] = questionGenSteps.map((step) => ({
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
          <h2 className="text-fluid-lg font-semibold">AI is preparing your interview</h2>
          <p className="mt-1 text-sm text-foreground-secondary">Crafting questions tailored to your configuration.</p>
        </div>
        <div className="w-full text-left">
          <TimelineCard steps={steps} />
        </div>
      </GlassCard>
    </FadeIn>
  );
}
