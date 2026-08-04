/**
 * ⚠️ Like matching.ts/career.ts before it, no `interview.routes.js` has
 * been shared yet. These types describe the *assumed* contract documented
 * in services/interview.api.ts — same envelope, same "AI pipeline runs
 * synchronously server-side" grammar as the Resume/Matching/Career modules.
 */

export type InterviewType =
  | "Technical"
  | "HR"
  | "Behavioral"
  | "System Design"
  | "Project Discussion"
  | "Mixed";

export type InterviewSessionType = "TECHNICAL" | "HR" | "BEHAVIOURAL";

export type InterviewDifficulty = "Easy" | "Medium" | "Hard" | "Expert";

export type ExperienceLevel = "Fresher" | "1-2 Years" | "3-5 Years" | "5+ Years";

export interface InterviewConfig {
  type: InterviewType;
  difficulty: InterviewDifficulty;
  experienceLevel: ExperienceLevel;
  targetRole: string;
  timed?: boolean;
}

export interface InterviewQuestion {
  id: string;
  prompt: string;
  category: string;
  difficulty: InterviewDifficulty;
  estimatedAnswerSeconds: number;
  hint?: string;
}

export interface AnswerEvaluation {
  communicationScore: number;
  technicalAccuracy: number;
  confidenceScore: number;
  clarity: number;
  problemSolving: number;
  grammar: number;
  completeness: number;
  overallRating: number;
  strengths: string[];
  weaknesses: string[];
  suggestedImprovements: string[];
  alternativeAnswer: string;
  missingPoints: string[];
  recommendedReading: string[];
}

export interface AnsweredQuestion {
  question: InterviewQuestion;
  answerText: string;
  responseTimeSeconds: number;
  evaluation: AnswerEvaluation;
}

export interface InterviewSessionSummary {
  id: string;
  resumeId?: string | null;
  role: string;
  type: InterviewSessionType;
  timed: boolean;
  status: "generating" | "in_progress" | "completed";
  currentQuestionIndex: number;
  questionCount: number;
}

export interface InterviewSession {
  id: string;
  config: InterviewConfig;
  questions: InterviewQuestion[];
  status: "generating" | "in_progress" | "completed";
  createdAt: string;
}

export interface CategoryScore {
  category: string;
  score: number;
}

export interface ConfidenceTimelinePoint {
  questionIndex: number;
  confidenceScore: number;
}

export interface ResponseTimePoint {
  questionIndex: number;
  seconds: number;
  estimatedSeconds: number;
}

export interface PerformanceReport {
  sessionId: string;
  overallScore: number;
  interviewReadiness: number;
  confidenceLevel: number;
  technicalScore: number;
  communicationScore: number;
  starScore?: number;
  averageResponseTimeSeconds: number;
  questionAccuracy: number;
  categoryScores: CategoryScore[];
  confidenceTimeline: ConfidenceTimelinePoint[];
  responseTimes: ResponseTimePoint[];
  strengths?: string[];
  weaknesses?: string[];
  perQuestionBreakdown?: Array<{ questionId: string; questionPrompt: string; score: number; feedback: string }>;
  answers: AnsweredQuestion[];
}

export interface RecommendedPracticeItem {
  id: string;
  title: string;
  description: string;
  category: InterviewType | "Coding Practice";
}

export interface InterviewHistoryEntry {
  id: string;
  date: string;
  targetRole: string;
  difficulty: InterviewDifficulty;
  overallScore: number;
  timeTakenSeconds: number;
  result: "Strong Pass" | "Pass" | "Needs Improvement";
}
