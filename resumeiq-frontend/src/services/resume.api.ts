import { apiClient } from "./apiClient";
import type { ApiResponse, Resume } from "@/types";

/**
 * All calls here hit the real backend (server/src/routes/resume.routes.js):
 *   POST   /resumes/upload         — multipart, field name "resume"
 *   GET    /resumes/latest
 *   GET    /resumes/history
 *   GET    /resumes/:id
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
