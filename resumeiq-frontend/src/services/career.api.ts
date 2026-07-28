import { apiClient } from "./apiClient";
import type { ApiResponse, AnalyzeCareerRoadmapPayload, CareerRoadmapResult, RoadmapStep } from "@/types";

/**
 * Assumed endpoints for the AI Skill Gap Analysis & Career Roadmap module —
 * mirrors the real `/resumes/*` envelope ({ success, message, data }) and
 * the same "no career.routes.js shared yet" situation documented in
 * `matching.api.ts`.
 *   POST  /career/analyze              — { resumeId, targetRole } -> CareerRoadmapResult
 *                                         (single AI pipeline call — covers the Skill
 *                                         Gap, Career Roadmap, Certifications and
 *                                         Recommendations concerns in one nested
 *                                         result, same grammar as MatchResult/AtsScorecard)
 *   PATCH /career/:resultId/roadmap/:stepId — { status } -> updated RoadmapStep[]
 *                                         (Progress API — persists roadmap step
 *                                         completion so it survives a refresh)
 * Nothing else in the app should call these endpoints directly — always go
 * through this module.
 */

export interface AnalyzeCareerRoadmapOptions {
  signal?: AbortSignal;
}

export async function analyzeCareerRoadmap(
  payload: AnalyzeCareerRoadmapPayload,
  options: AnalyzeCareerRoadmapOptions = {}
): Promise<CareerRoadmapResult> {
  const { data } = await apiClient.post<ApiResponse<{ roadmap: CareerRoadmapResult }>>("/career/analyze", payload, {
    signal: options.signal,
  });
  return data.data.roadmap;
}

export async function updateRoadmapStepStatus(
  resultId: string,
  stepId: string,
  status: RoadmapStep["status"]
): Promise<RoadmapStep[]> {
  const { data } = await apiClient.patch<ApiResponse<{ roadmap: RoadmapStep[] }>>(
    `/career/${resultId}/roadmap/${stepId}`,
    { status }
  );
  return data.data.roadmap;
}
