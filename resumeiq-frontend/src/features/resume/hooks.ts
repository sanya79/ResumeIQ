import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as resumeApi from "@/services/resume.api";
import type { UploadResumeOptions } from "@/services/resume.api";

/** Centralized query keys — avoids typo'd cache-key mismatches between the
 * hooks below and any future invalidation calls elsewhere in the app. */
export const resumeQueryKeys = {
  latest: ["resume", "latest"] as const,
  history: ["resume", "history"] as const,
  details: (id: string) => ["resume", "details", id] as const,
  versions: (id: string) => ["resume", "versions", id] as const,
  optimizations: (id: string) => ["resume", "optimizations", id] as const,
  knowledgeGraph: (id: string) => ["resume", "knowledge-graph", id] as const,
  chat: (id: string) => ["resume", "chat", id] as const,
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

export function useResumeVersions(id: string | undefined) {
  return useQuery({
    queryKey: resumeQueryKeys.versions(id ?? ""),
    queryFn: () => resumeApi.getResumeVersions(id as string),
    enabled: Boolean(id),
  });
}

export function useCompareResumeVersions() {
  return useMutation({
    mutationFn: ({ from, to }: { from: string; to: string }) => resumeApi.compareResumeVersions(from, to),
  });
}

export function useResumeOptimizations(id: string | undefined) {
  return useQuery({
    queryKey: resumeQueryKeys.optimizations(id ?? ""),
    queryFn: () => resumeApi.getResumeOptimizations(id as string),
    enabled: Boolean(id),
  });
}

export function useResumeKnowledgeGraph(id: string | undefined) {
  return useQuery({
    queryKey: resumeQueryKeys.knowledgeGraph(id ?? ""),
    queryFn: () => resumeApi.getResumeKnowledgeGraph(id as string),
    enabled: Boolean(id),
  });
}

export function useOptimizeResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, targetRole, targetCompany }: { id: string; targetRole?: string; targetCompany?: string }) =>
      resumeApi.optimizeResume(id, { targetRole, targetCompany }),
    onSuccess: (optimization, variables) => {
      queryClient.invalidateQueries({ queryKey: resumeQueryKeys.optimizations(variables.id) });
      queryClient.invalidateQueries({ queryKey: resumeQueryKeys.details(variables.id) });
      queryClient.setQueryData(resumeQueryKeys.optimizations(variables.id), [optimization]);
    },
  });
}

export function useApplyResumeOptimization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, rawText }: { id: string; rawText: string }) => resumeApi.applyResumeOptimization(id, rawText),
    onSuccess: (resume) => {
      queryClient.setQueryData(resumeQueryKeys.latest, resume);
      queryClient.setQueryData(resumeQueryKeys.details(resume._id), resume);
      queryClient.invalidateQueries({ queryKey: resumeQueryKeys.latest });
      queryClient.invalidateQueries({ queryKey: resumeQueryKeys.details(resume._id) });
      queryClient.invalidateQueries({ queryKey: resumeQueryKeys.history });
      queryClient.invalidateQueries({ queryKey: resumeQueryKeys.optimizations(resume._id) });
    },
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

export function useResumeChatHistory(id: string | undefined) {
  return useQuery({
    queryKey: resumeQueryKeys.chat(id ?? ""),
    queryFn: () => resumeApi.getResumeChatHistory(id as string),
    enabled: Boolean(id),
  });
}

export function useSendResumeChatMessage(id: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { message: string; conversationId?: string }) => resumeApi.sendResumeChatMessage(id as string, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resumeQueryKeys.chat(id ?? "") });
    },
  });
}
