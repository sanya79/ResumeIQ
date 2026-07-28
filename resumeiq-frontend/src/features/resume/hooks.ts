import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as resumeApi from "@/services/resume.api";
import type { UploadResumeOptions } from "@/services/resume.api";

/** Centralized query keys — avoids typo'd cache-key mismatches between the
 * hooks below and any future invalidation calls elsewhere in the app. */
export const resumeQueryKeys = {
  latest: ["resume", "latest"] as const,
  history: ["resume", "history"] as const,
  details: (id: string) => ["resume", "details", id] as const,
};

/** The user's current active resume + its ATS scorecard, if one exists. */
export function useLatestResume() {
  return useQuery({
    queryKey: resumeQueryKeys.latest,
    queryFn: resumeApi.getLatestResume,
  });
}

export function useResumeHistory() {
  return useQuery({
    queryKey: resumeQueryKeys.history,
    queryFn: resumeApi.getResumeHistory,
  });
}

export function useResumeDetails(id: string | undefined) {
  return useQuery({
    queryKey: resumeQueryKeys.details(id ?? ""),
    queryFn: () => resumeApi.getResumeDetails(id as string),
    enabled: Boolean(id),
  });
}

/**
 * Runs the real upload → parse → ATS-evaluate pipeline. There is no
 * separate polling endpoint yet — the mutation's pending/success/error
 * state *is* the analysis status, and the resolved resume already carries
 * its final atsScorecard (see resume.api.ts's docstring).
 */
export function useUploadResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { file: File } & Omit<UploadResumeOptions, "onUploadProgress"> & {
      onUploadProgress?: (percent: number) => void;
    }) => resumeApi.uploadResume(vars.file, vars),
    onSuccess: (resume) => {
      queryClient.setQueryData(resumeQueryKeys.latest, resume);
      queryClient.invalidateQueries({ queryKey: resumeQueryKeys.history });
    },
  });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resumeApi.deleteResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resumeQueryKeys.latest });
      queryClient.invalidateQueries({ queryKey: resumeQueryKeys.history });
    },
  });
}

export function useRestoreResumeVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resumeApi.restoreResumeVersion(id),
    onSuccess: (resume) => {
      queryClient.setQueryData(resumeQueryKeys.latest, resume);
      queryClient.invalidateQueries({ queryKey: resumeQueryKeys.history });
    },
  });
}
