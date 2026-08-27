import { useEffect, useRef, useState } from "react";

export type CareerPipelineStepId =
  | "reading-resume"
  | "comparing-target-role"
  | "identifying-gaps"
  | "building-roadmap"
  | "curating-resources";

export interface CareerPipelineStep {
  id: CareerPipelineStepId;
  label: string;
  estimateSeconds: number;
}

export const careerPipelineSteps: CareerPipelineStep[] = [
  { id: "reading-resume", label: "Reading Resume", estimateSeconds: 2 },
  { id: "comparing-target-role", label: "Comparing to Target Role", estimateSeconds: 2.5 },
  { id: "identifying-gaps", label: "Identifying Skill Gaps", estimateSeconds: 3 },
  { id: "building-roadmap", label: "Building Learning Roadmap", estimateSeconds: 2.5 },
  { id: "curating-resources", label: "Curating Resources & Certifications", estimateSeconds: 2 },
];

export type CareerStepStatus = "pending" | "active" | "complete";

/**
 * Same shape as `useMatchPipeline`/`useAnalysisPipeline`: the real
 * `POST /career/analyze` call almost certainly runs this whole pipeline
 * synchronously server-side (no per-step SSE/websocket event to subscribe
 * to yet). This hook advances through the steps on an estimated cadence
 * for a legible "Done" moment, but never marks the final step complete
 * until `isPending` actually goes false, so a slow real request just holds
 * on the last step instead of lying about being finished.
 */
export function useCareerPipeline(isPending: boolean) {
  const [activeIndex, setActiveIndex] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!isPending) {
      setActiveIndex(0);
      return;
    }

    function advance(index: number) {
      if (index >= careerPipelineSteps.length - 1) return;
      timeoutRef.current = setTimeout(() => {
        setActiveIndex(index + 1);
        advance(index + 1);
      }, careerPipelineSteps[index].estimateSeconds * 1000);
    }

    advance(0);
    return () => clearTimeout(timeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending]);

  const statuses: Record<CareerPipelineStepId, CareerStepStatus> = careerPipelineSteps.reduce(
    (acc, step, i) => {
      acc[step.id] = i < activeIndex ? "complete" : i === activeIndex ? "active" : "pending";
      return acc;
    },
    {} as Record<CareerPipelineStepId, CareerStepStatus>
  );

  const isDone = !isPending && activeIndex === careerPipelineSteps.length - 1;

  return { activeIndex, statuses, isDone };
}
