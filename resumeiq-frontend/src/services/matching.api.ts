import { apiClient } from "./apiClient";
import type { ApiResponse, AnalyzeJobMatchPayload, JobDescriptionRecord, MatchResult, SavedMatchComparison } from "@/types";

/**
 * Assumed endpoints for the AI Job Matching Engine — mirrors the real
 * `/resumes/*` contract's envelope ({ success, message, data }) since no
 * `matching.routes.js` has been shared yet (see types/matching.ts note).
 *   POST   /matching/analyze        — { resumeId, jobDescription, jobTitle?, company? } -> MatchResult
 *   GET    /matching/history        — saved comparisons for the current user
 *   GET    /matching/:id            — a single saved/past MatchResult
 *   POST   /matching/:id/save       — flips isSaved true, used by "Save Comparison"
 *   DELETE /matching/:id            — removes a saved comparison
 * Nothing else in the app should call these endpoints directly — always
 * go through this module.
 */

export interface AnalyzeJobMatchOptions {
  signal?: AbortSignal;
}

export async function analyzeJobMatch(
  payload: AnalyzeJobMatchPayload,
  options: AnalyzeJobMatchOptions = {}
): Promise<MatchResult> {
  const { data } = await apiClient.post<ApiResponse<{ match: MatchResult }>>("/matching/analyze", payload, {
    signal: options.signal,
  });
  return data.data.match;
}

export async function saveJobDescription(payload: { title?: string; company?: string; text: string; source?: string }): Promise<JobDescriptionRecord> {
  const { data } = await apiClient.post<ApiResponse<{ jobDescription: JobDescriptionRecord }>>("/matching/job-descriptions", payload);
  return data.data.jobDescription;
}

export async function getJobDescriptions(): Promise<JobDescriptionRecord[]> {
  const { data } = await apiClient.get<ApiResponse<{ jobDescriptions: JobDescriptionRecord[] }>>("/matching/job-descriptions");
  return data.data.jobDescriptions;
}

export async function getMatchHistory(): Promise<SavedMatchComparison[]> {
  const { data } = await apiClient.get<ApiResponse<{ history: SavedMatchComparison[] }>>("/matching/history");
  return data.data.history;
}

export async function getMatchDetails(id: string): Promise<MatchResult> {
  const { data } = await apiClient.get<ApiResponse<{ match: MatchResult }>>(`/matching/${id}`);
  return data.data.match;
}

export async function saveMatchComparison(id: string): Promise<MatchResult> {
  const { data } = await apiClient.post<ApiResponse<{ match: MatchResult }>>(`/matching/${id}/save`);
  return data.data.match;
}

export async function deleteMatchComparison(id: string): Promise<void> {
  await apiClient.delete(`/matching/${id}`);
}

export async function downloadOptimizedResumePdf(id: string): Promise<void> {
  const response = await apiClient.get(`/matching/${id}/optimize-pdf`, {
    responseType: "blob",
  });

  const contentType = typeof response.headers["content-type"] === "string"
    ? response.headers["content-type"]
    : "application/pdf";
  const blob = new Blob([response.data], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `optimized-resume.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function downloadGeneratedResumePdf(id: string): Promise<void> {
  const response = await apiClient.get(`/matching/${id}/generate-pdf`, {
    responseType: "blob",
  });

  const contentType = typeof response.headers["content-type"] === "string"
    ? response.headers["content-type"]
    : "application/pdf";
  const blob = new Blob([response.data], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `tailored-resume.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
