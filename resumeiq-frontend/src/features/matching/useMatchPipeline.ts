import { useEffect, useRef, useState } from "react";

export type MatchPipelineStepId =
  | "reading-jd"
  | "extracting-keywords"
  | "comparing-resume"
  | "calculating-match"
  | "generating-suggestions";

export interface MatchPipelineStep {
  id: MatchPipelineStepId;
  label: string;
  estimateSeconds: number;
}

export const matchPipelineSteps: MatchPipelineStep[] = [
  { id: "reading-jd", label: "Reading Job Description", estimateSeconds: 2 },
  { id: "extracting-keywords", label: "Extracting Keywords", estimateSeconds: 2.5 },
  { id: "comparing-resume", label: "Comparing Resume", estimateSeconds: 3 },
  { id: "calculating-match", label: "Calculating Match", estimateSeconds: 2.5 },
  { id: "generating-suggestions", label: "Generating Suggestions", estimateSeconds: 2 },
];

export type MatchStepStatus = "pending" | "active" | "complete";

/**
 * Same shape as `useAnalysisPipeline`: the real `POST /matching/analyze`
 * call almost certainly runs this whole pipeline synchronously server-side
 * (no per-step SSE/websocket event to subscribe to yet). This hook advances
 * through the steps on an estimated cadence for a legible "Done" moment,
 * but — like the resume pipeline — never marks the final step complete
 * until `isPending` actually goes false, so a slow real request just holds
 * on the last step instead of lying about being finished.
 */
export function useMatchPipeline(isPending: boolean) {
  const [activeIndex, setActiveIndex] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!isPending) {
      setActiveIndex(0);
      return;
    }

    function advance(index: number) {
      if (index >= matchPipelineSteps.length - 1) return;
      timeoutRef.current = setTimeout(() => {
        setActiveIndex(index + 1);
        advance(index + 1);
      }, matchPipelineSteps[index].estimateSeconds * 1000);
    }

    advance(0);
    return () => clearTimeout(timeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending]);

  const statuses: Record<MatchPipelineStepId, MatchStepStatus> = matchPipelineSteps.reduce(
    (acc, step, i) => {
      acc[step.id] = i < activeIndex ? "complete" : i === activeIndex ? "active" : "pending";
      return acc;
    },
    {} as Record<MatchPipelineStepId, MatchStepStatus>
  );

  const isDone = !isPending && activeIndex === matchPipelineSteps.length - 1;

  return { activeIndex, statuses, isDone };
}
