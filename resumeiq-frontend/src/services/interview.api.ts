import { apiClient } from "./apiClient";
import type {
  ApiResponse,
  InterviewConfig,
  InterviewQuestion,
  AnswerEvaluation,
  PerformanceReport,
  InterviewHistoryEntry,
  RecommendedPracticeItem,
} from "@/types";

/**
 * Assumed endpoints for the AI Interview Preparation module — same
 * situation as matching.api.ts/career.api.ts: no `interview.routes.js`
 * has been shared, so this mirrors the real `/resumes/*` envelope
 * ({ success, message, data }) and documents the assumed contract rather
 * than inventing a silently-fake one.
 *
 *   POST /interview/questions              — { config } -> { sessionId, questions }
 *   POST /interview/sessions/:id/answer    — { questionId, answerText, responseTimeSeconds }
 *                                             -> { evaluation }  (submit + evaluate combined
 *                                             in one round trip, same synchronous-pipeline
 *                                             grammar as resume upload / job matching)
 *   POST /interview/sessions/:id/complete  -> { report }
 *   GET  /interview/history                -> past sessions, newest first
 *   GET  /interview/history/:id            -> { report } for a completed past session
 *   GET  /interview/recommendations        -> suggested next practice areas
 *
 * Nothing else in the app should call these endpoints directly — always
 * go through this module.
 */

export interface GenerateQuestionsResult {
  sessionId: string;
  questions: InterviewQuestion[];
}

export async function generateInterviewQuestions(
  config: InterviewConfig,
  options: { signal?: AbortSignal } = {}
): Promise<GenerateQuestionsResult> {
  const { data } = await apiClient.post<ApiResponse<GenerateQuestionsResult>>(
    "/interview/questions",
    { config },
    { signal: options.signal }
  );
  return data.data;
}

export async function submitInterviewAnswer(
  sessionId: string,
  payload: { questionId: string; answerText: string; responseTimeSeconds: number }
): Promise<AnswerEvaluation> {
  const { data } = await apiClient.post<ApiResponse<{ evaluation: AnswerEvaluation }>>(
    `/interview/sessions/${sessionId}/answer`,
    payload
  );
  return data.data.evaluation;
}

export async function completeInterviewSession(sessionId: string): Promise<PerformanceReport> {
  const { data } = await apiClient.post<ApiResponse<{ report: PerformanceReport }>>(
    `/interview/sessions/${sessionId}/complete`
  );
  return data.data.report;
}

export async function getInterviewHistory(): Promise<InterviewHistoryEntry[]> {
  const { data } = await apiClient.get<ApiResponse<{ history: InterviewHistoryEntry[] }>>("/interview/history");
  return data.data.history;
}

export async function getPastInterviewReport(id: string): Promise<PerformanceReport> {
  const { data } = await apiClient.get<ApiResponse<{ report: PerformanceReport }>>(`/interview/history/${id}`);
  return data.data.report;
}

export async function getRecommendedPractice(): Promise<RecommendedPracticeItem[]> {
  const { data } = await apiClient.get<ApiResponse<{ recommendations: RecommendedPracticeItem[] }>>(
    "/interview/recommendations"
  );
  return data.data.recommendations;
}
