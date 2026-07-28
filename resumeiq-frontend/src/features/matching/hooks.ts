import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as matchingApi from "@/services/matching.api";
import type { AnalyzeJobMatchPayload } from "@/types";

/** Centralized query keys — avoids typo'd cache-key mismatches. */
export const matchingQueryKeys = {
  history: ["matching", "history"] as const,
  details: (id: string) => ["matching", "details", id] as const,
};

/** Runs the real resume-vs-job-description analysis. The mutation's
 * pending/success/error state drives the AI Processing timeline and the
 * results view — same pattern as `useUploadResume`. */
export function useAnalyzeJobMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AnalyzeJobMatchPayload) => matchingApi.analyzeJobMatch(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchingQueryKeys.history });
    },
  });
}

export function useMatchHistory() {
  return useQuery({
    queryKey: matchingQueryKeys.history,
    queryFn: matchingApi.getMatchHistory,
  });
}

export function useMatchDetails(id: string | undefined) {
  return useQuery({
    queryKey: matchingQueryKeys.details(id ?? ""),
    queryFn: () => matchingApi.getMatchDetails(id as string),
    enabled: Boolean(id),
  });
}

export function useSaveMatchComparison() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => matchingApi.saveMatchComparison(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchingQueryKeys.history });
    },
  });
}

export function useDeleteMatchComparison() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => matchingApi.deleteMatchComparison(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchingQueryKeys.history });
    },
  });
}
