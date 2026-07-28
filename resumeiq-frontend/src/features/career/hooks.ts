import { useMutation } from "@tanstack/react-query";
import * as careerApi from "@/services/career.api";
import type { AnalyzeCareerRoadmapPayload, RoadmapStep } from "@/types";

/** Runs the real resume-vs-target-role AI analysis. The mutation's
 * pending/success/error state drives the processing timeline and the
 * report view — same pattern as `useAnalyzeJobMatch`. */
export function useAnalyzeCareerRoadmap() {
  return useMutation({
    mutationFn: (payload: AnalyzeCareerRoadmapPayload) => careerApi.analyzeCareerRoadmap(payload),
  });
}

/** Persists a single roadmap step's completion status (Progress API). */
export function useUpdateRoadmapStepStatus() {
  return useMutation({
    mutationFn: (vars: { resultId: string; stepId: string; status: RoadmapStep["status"] }) =>
      careerApi.updateRoadmapStepStatus(vars.resultId, vars.stepId, vars.status),
  });
}
