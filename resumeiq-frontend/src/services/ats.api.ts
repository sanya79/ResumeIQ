import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./apiClient";
import type { ApiResponse, AtsScorecard, RecruiterSimulationResult } from "@/types";

export interface AtsAnalysisResponse {
  scorecard: AtsScorecard;
  compatibilityReport: {
    overall: number;
    verdict: string;
    issues: string[];
  };
  improvementSuggestions: string[];
  heatmap: Array<{ section: string; score: number; confidence: number }>;
}

export async function analyzeResume(resumeId: string): Promise<AtsAnalysisResponse> {
  const { data } = await apiClient.post<ApiResponse<{ analysis: AtsAnalysisResponse }>>("/ats/analyze", {
    resumeId,
  });
  return data.data.analysis;
}

export async function getAtsHistory(resumeId: string): Promise<Array<{ label: string; score: number; date: string }>> {
  const { data } = await apiClient.get<ApiResponse<{ history: Array<{ label: string; score: number; date: string }> }>>(`/ats/history/${resumeId}`);
  return data.data.history;
}

export async function simulateRecruiterReview(resumeId: string, jobDescription = ""): Promise<RecruiterSimulationResult> {
  const { data } = await apiClient.post<ApiResponse<{ simulation: RecruiterSimulationResult }>>("/ats/simulate-recruiter", {
    resumeId,
    jobDescription,
  });
  return data.data.simulation;
}

export function useAtsAnalysis(resumeId: string | undefined) {
  return useQuery({
    queryKey: ["ats", "analysis", resumeId ?? ""],
    queryFn: () => analyzeResume(resumeId as string),
    enabled: Boolean(resumeId),
  });
}

export function useAtsHistory(resumeId: string | undefined) {
  return useQuery({
    queryKey: ["ats", "history", resumeId ?? ""],
    queryFn: () => getAtsHistory(resumeId as string),
    enabled: Boolean(resumeId),
  });
}

export function useRecruiterSimulation(resumeId: string | undefined, jobDescription = "") {
  return useQuery({
    queryKey: ["ats", "recruiter-simulation", resumeId ?? "", jobDescription],
    queryFn: () => simulateRecruiterReview(resumeId as string, jobDescription),
    enabled: Boolean(resumeId),
  });
}
