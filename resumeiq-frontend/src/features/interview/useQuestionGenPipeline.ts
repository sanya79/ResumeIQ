import { useEffect, useRef, useState } from "react";

export type QuestionGenStepId = "reading-profile" | "selecting-topics" | "drafting-questions" | "calibrating-difficulty";

export interface QuestionGenStep {
  id: QuestionGenStepId;
  label: string;
  estimateSeconds: number;
}

export const questionGenSteps: QuestionGenStep[] = [
  { id: "reading-profile", label: "Reading Your Configuration", estimateSeconds: 1.5 },
  { id: "selecting-topics", label: "Selecting Topics", estimateSeconds: 2 },
  { id: "drafting-questions", label: "Drafting Questions", estimateSeconds: 2.5 },
  { id: "calibrating-difficulty", label: "Calibrating Difficulty", estimateSeconds: 1.5 },
];

export type GenStepStatus = "pending" | "active" | "complete";

/** Same grammar as useAnalysisPipeline/useMatchPipeline: the real question
 * generation call almost certainly runs synchronously server-side, so this
 * advances on an estimated cadence but holds on the last step until the
 * mutation actually resolves. */
export function useQuestionGenPipeline(isPending: boolean) {
  const [activeIndex, setActiveIndex] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!isPending) {
      setActiveIndex(0);
      return;
    }
    function advance(index: number) {
      if (index >= questionGenSteps.length - 1) return;
      timeoutRef.current = setTimeout(() => {
        setActiveIndex(index + 1);
        advance(index + 1);
      }, questionGenSteps[index].estimateSeconds * 1000);
    }
    advance(0);
    return () => clearTimeout(timeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending]);

  const statuses: Record<QuestionGenStepId, GenStepStatus> = questionGenSteps.reduce(
    (acc, step, i) => {
      acc[step.id] = i < activeIndex ? "complete" : i === activeIndex ? "active" : "pending";
      return acc;
    },
    {} as Record<QuestionGenStepId, GenStepStatus>
  );

  return { statuses };
}
