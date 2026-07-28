import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as interviewApi from "@/services/interview.api";
import type { InterviewConfig } from "@/types";

export const interviewQueryKeys = {
  history: ["interview", "history"] as const,
  pastReport: (id: string) => ["interview", "history", id] as const,
  recommendations: ["interview", "recommendations"] as const,
};

/** Kicks off question generation for a chosen config. Mutation state
 * (pending/success/error) drives the "Generating Questions" pipeline UI. */
export function useGenerateQuestions() {
  return useMutation({
    mutationFn: (config: InterviewConfig) => interviewApi.generateInterviewQuestions(config),
  });
}

/** Submits + evaluates a single answer in one round trip. */
export function useSubmitAnswer(sessionId: string | undefined) {
  return useMutation({
    mutationFn: (payload: { questionId: string; answerText: string; responseTimeSeconds: number }) =>
      interviewApi.submitInterviewAnswer(sessionId as string, payload),
  });
}

export function useCompleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => interviewApi.completeInterviewSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: interviewQueryKeys.history });
    },
  });
}

export function useInterviewHistory() {
  return useQuery({
    queryKey: interviewQueryKeys.history,
    queryFn: interviewApi.getInterviewHistory,
  });
}

export function usePastInterviewReport(id: string | undefined) {
  return useQuery({
    queryKey: interviewQueryKeys.pastReport(id ?? ""),
    queryFn: () => interviewApi.getPastInterviewReport(id as string),
    enabled: Boolean(id),
  });
}

export function useRecommendedPractice() {
  return useQuery({
    queryKey: interviewQueryKeys.recommendations,
    queryFn: interviewApi.getRecommendedPractice,
  });
}
