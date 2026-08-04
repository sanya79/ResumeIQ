import { apiClient } from "./apiClient";
import type { ApiResponse, Resume, ResumeChatMessage, ResumeChatResponse, ResumeOptimization } from "@/types";

/**
 * All calls here hit the real backend (server/src/routes/resume.routes.js):
 *   POST   /resumes/upload         — multipart, field name "resume"
 *   GET    /resumes/latest
 *   GET    /resumes/history
 *   GET    /resumes/:id
 *   GET    /resumes/:id/versions
 *   GET    /resumes/compare?from=&to=
 *   DELETE /resumes/:id
 *   POST   /resumes/:id/restore
 *
 * Every response is wrapped as { success, message, data } — see
 * server/src/utils/response.js. Nothing else in the app should call these
 * endpoints directly; always go through this module.
 */

export interface UploadResumeOptions {
  uploadSource?: string;
  onUploadProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

/** Runs the full ingestion pipeline server-side (parse → ATS-evaluate →
 * persist) synchronously within this one request — there is no separate
 * polling endpoint yet (see pipeline.service.js: designed to swap for a
 * queue later). The promise only resolves once analysis is complete. */
export async function uploadResume(file: File, options: UploadResumeOptions = {}): Promise<Resume> {
  const formData = new FormData();
  formData.append("resume", file);
  if (options.uploadSource) formData.append("uploadSource", options.uploadSource);

  const { data } = await apiClient.post<ApiResponse<{ resume: Resume }>>("/resumes/upload", formData, {
    signal: options.signal,
    onUploadProgress: (event) => {
      if (!options.onUploadProgress || !event.total) return;
      options.onUploadProgress(Math.round((event.loaded / event.total) * 100));
    },
  });

  return data.data.resume;
}

/** Returns null when the user has never uploaded a resume — the backend
 * responds with `data: null` in that case rather than a 404. */
export async function getLatestResume(): Promise<Resume | null> {
  const { data } = await apiClient.get<ApiResponse<{ resume: Resume } | null>>("/resumes/latest");
  return data.data?.resume ?? null;
}

export async function getResumeHistory(): Promise<Resume[]> {
  const { data } = await apiClient.get<ApiResponse<{ history: Resume[] }>>("/resumes/history");
  return data.data.history;
}

export async function getResumeAnalysis(id: string): Promise<Resume> {
  const { data } = await apiClient.get<ApiResponse<{ resume: Resume }>>(`/resumes/${id}`);
  return data.data.resume;
}

export async function getResumeDetails(id: string): Promise<Resume> {
  const { data } = await apiClient.get<ApiResponse<{ resume: Resume }>>(`/resumes/${id}`);
  return data.data.resume;
}

export async function deleteResume(id: string): Promise<void> {
  await apiClient.delete(`/resumes/${id}`);
}

export async function restoreResumeVersion(id: string): Promise<Resume> {
  const { data } = await apiClient.post<ApiResponse<{ resume: Resume }>>(`/resumes/${id}/restore`);
  return data.data.resume;
}

export async function getResumeVersions(id: string): Promise<Resume[]> {
  const { data } = await apiClient.get<ApiResponse<{ versions: Resume[] }>>(`/resumes/${id}/versions`);
  return data.data.versions;
}

export async function compareResumeVersions(from: string, to: string): Promise<{
  from: string;
  to: string;
  addedSkills: string[];
  removedSkills: string[];
  sectionDiffs: Array<{ section: string; changed: boolean }>;
}> {
  const { data } = await apiClient.get<ApiResponse<{ comparison: any }>>(`/resumes/compare?from=${from}&to=${to}`);
  return data.data.comparison;
}

export async function optimizeResume(id: string, payload: { targetRole?: string; targetCompany?: string }): Promise<ResumeOptimization> {
  const { data } = await apiClient.post<ApiResponse<{ optimization: ResumeOptimization }>>(`/resumes/${id}/optimize`, payload);
  return data.data.optimization;
}

export async function getResumeOptimizations(id: string): Promise<ResumeOptimization[]> {
  const { data } = await apiClient.get<ApiResponse<{ optimizations: ResumeOptimization[] }>>(`/resumes/${id}/optimizations`);
  return data.data.optimizations;
}

export async function getResumeKnowledgeGraph(id: string): Promise<{ nodes: any[]; edges: any[] }> {
  const { data } = await apiClient.get<ApiResponse<{ graph: { nodes: any[]; edges: any[] } }>>(`/resumes/${id}/knowledge-graph`);
  return data.data.graph;
}

export async function applyResumeOptimization(id: string, rawText: string): Promise<Resume> {
  const { data } = await apiClient.post<ApiResponse<{ resume: Resume }>>(`/resumes/${id}/apply-optimization`, { rawText });
  return data.data.resume;
}

export async function getResumeChatHistory(id: string): Promise<ResumeChatMessage[]> {
  const { data } = await apiClient.get<ApiResponse<{ messages: ResumeChatMessage[] }>>(`/resumes/${id}/chat`);
  return data.data.messages;
}

export async function sendResumeChatMessage(id: string, payload: { message: string; conversationId?: string }): Promise<ResumeChatResponse> {
  const { data } = await apiClient.post<ApiResponse<{ answer: string; sourceSnippets: ResumeChatResponse["sourceSnippets"]; conversationId?: string }>>(`/resumes/${id}/chat`, payload);
  return {
    answer: data.data.answer,
    sourceSnippets: data.data.sourceSnippets,
    conversationId: data.data.conversationId,
  };
}

export async function downloadOptimizedResumePdf(id: string, jobTitle?: string): Promise<void> {
  const params = new URLSearchParams();
  if (jobTitle) params.set("jobTitle", jobTitle);

  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await apiClient.get(`/resumes/${id}/optimized-pdf${query}`, {
    responseType: "blob",
  });

  const contentType = typeof response.headers["content-type"] === "string"
    ? response.headers["content-type"]
    : "application/pdf";
  const blob = new Blob([response.data], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${(jobTitle || "optimized-resume").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-resume.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
