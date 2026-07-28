import { useEffect, useRef, useState } from "react";

export type PipelineStepId = "uploading" | "extracting" | "analyzing" | "ats-evaluation" | "generating";

export interface PipelineStep {
  id: PipelineStepId;
  label: string;
  estimateSeconds: number;
}

export const pipelineSteps: PipelineStep[] = [
  { id: "uploading", label: "Uploading", estimateSeconds: 2 },
  { id: "extracting", label: "Extracting Text", estimateSeconds: 3 },
  { id: "analyzing", label: "Analyzing Resume", estimateSeconds: 4 },
  { id: "ats-evaluation", label: "ATS Evaluation", estimateSeconds: 4 },
  { id: "generating", label: "Generating AI Suggestions", estimateSeconds: 2 },
];

export type StepStatus = "pending" | "active" | "complete";

/**
 * ⚠️ The real backend runs this whole pipeline synchronously inside a
 * single POST /resumes/upload call — there's no per-step server event to
 * subscribe to (see pipeline.service.js, which notes it's "designed to
 * swap for BullMQ queue triggers later"). Until then, this hook advances
 * through the steps on an estimated cadence for a legible UI, but never
 * marks the final step complete until `isPending` actually goes false —
 * so a slow real request simply holds on the last step rather than lying
 * about being done.
 */
export function useAnalysisPipeline(isPending: boolean) {
  const [activeIndex, setActiveIndex] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!isPending) {
      setActiveIndex(0);
      return;
    }

    function advance(index: number) {
      if (index >= pipelineSteps.length - 1) return; // hold on the last step until isPending flips false
      timeoutRef.current = setTimeout(() => {
        setActiveIndex(index + 1);
        advance(index + 1);
      }, pipelineSteps[index].estimateSeconds * 1000);
    }

    advance(0);
    return () => clearTimeout(timeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending]);

  const statuses: Record<PipelineStepId, StepStatus> = pipelineSteps.reduce(
    (acc, step, i) => {
      acc[step.id] = i < activeIndex ? "complete" : i === activeIndex ? "active" : "pending";
      return acc;
    },
    {} as Record<PipelineStepId, StepStatus>
  );

  return { activeIndex, statuses };
}
