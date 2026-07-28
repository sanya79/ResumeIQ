import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Circle } from "lucide-react";
import { ProgressBar } from "@/components/charts/ProgressBar";
import { GlassCard } from "@/components/cards/GlassCard";
import { cn } from "@/utils/cn";
import { pipelineSteps, type StepStatus, type PipelineStepId } from "../useAnalysisPipeline";

interface UploadProgressTimelineProps {
  statuses: Record<PipelineStepId, StepStatus>;
}

const statusStyles: Record<StepStatus, string> = {
  complete: "border-accent-emerald/30 bg-accent-emerald/5",
  active: "border-accent-purple/40 bg-accent-purple/5",
  pending: "border-surface-border",
};

export function UploadProgressTimeline({ statuses }: UploadProgressTimelineProps) {
  return (
    <GlassCard glow className="flex flex-col gap-3">
      {pipelineSteps.map((step, i) => {
        const status = statuses[step.id];
        const progress = status === "complete" ? 100 : status === "active" ? 60 : 0;

        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn("flex items-center gap-4 rounded-xl border px-4 py-3 transition-colors", statusStyles[status])}
          >
            <span className="shrink-0">
              {status === "complete" && <CheckCircle2 size={20} className="text-accent-emerald" />}
              {status === "active" && <Loader2 size={20} className="animate-spin text-accent-purple" />}
              {status === "pending" && <Circle size={20} className="text-foreground-secondary/40" />}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p
                  className={cn(
                    "text-sm font-medium",
                    status === "pending" ? "text-foreground-secondary" : "text-foreground"
                  )}
                >
                  {step.label}
                </p>
                {status !== "pending" && (
                  <span className="text-xs text-foreground-secondary">
                    {status === "complete" ? "Done" : `~${step.estimateSeconds}s`}
                  </span>
                )}
              </div>
              {status !== "pending" && <ProgressBar value={progress} className="mt-2" />}
            </div>
          </motion.div>
        );
      })}
    </GlassCard>
  );
}
