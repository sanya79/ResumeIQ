/**
 * AI Skill Gap Analysis & Personalized Career Roadmap contract types.
 *
 * ⚠️ Same situation `matching.ts` documents: no
 * `server/src/routes/career.routes.js` has been shared yet, so this shape
 * is a reasonable inference from the real `AtsScorecard` (types/ats.ts)
 * and `MatchResult` (types/matching.ts) contracts — same "0-100 score +
 * reason/evidence" grammar, extended with the career-roadmap-specific
 * concepts (skill category gap, learning roadmap, certifications, learning
 * resources, project recommendations, career timeline, AI insights). Swap
 * this out once `server/src/routes/career.routes.js` exists and its real
 * response shape is confirmed — nothing in the UI should need to change
 * shape-wise if the contract below turns out to be close.
 */

/** Broad skill-category groups the AI buckets a resume's skills into.
 * Kept as `string` (not a closed union) so the backend can introduce new
 * categories without a frontend type change — see pages/career/data.ts's
 * `targetRoles` for the same "easy to extend" intent. */
export type CareerSkillCategory = string;

/**
 * One scored skill category — Programming, Frameworks, Databases, Cloud,
 * DevOps, Soft Skills, Communication, Problem Solving, Leadership, etc.
 * Mirrors `SkillGapCategory` (types/matching.ts) but is target-role-scoped
 * rather than job-description-scoped, and carries an AI explanation
 * (same "reason" grammar as `AtsBreakdownItem`).
 */
export interface CareerSkillGapItem {
  id: string;
  category: CareerSkillCategory;
  currentLevel: number; // 0-100
  requiredLevel: number; // 0-100
  gap: number; // max(requiredLevel - currentLevel, 0)
  explanation: string; // AI-generated explanation of the gap
}

export interface CareerRadarPoint {
  subject: string;
  current: number;
  required: number;
  fullMark: number;
}

export type RoadmapDifficulty = "Beginner" | "Intermediate" | "Advanced";
export type RoadmapPriority = "High" | "Medium" | "Low";
export type RoadmapStepStatus = "not-started" | "in-progress" | "completed";

export interface RoadmapStep {
  id: string;
  order: number;
  title: string;
  description: string;
  estimatedDuration: string; // e.g. "3 weeks"
  difficulty: RoadmapDifficulty;
  priority: RoadmapPriority;
  status: RoadmapStepStatus;
  skillsCovered: string[];
}

export type ResourceDifficulty = "Beginner" | "Intermediate" | "Advanced";

export interface Certification {
  id: string;
  title: string;
  provider: string;
  difficulty: ResourceDifficulty;
  estimatedTime: string; // e.g. "6 weeks"
  description: string;
  url?: string;
}

export type LearningResourceCategory = "Videos" | "Courses" | "Books" | "Practice Platforms" | "Documentation";

export interface LearningResource {
  id: string;
  title: string;
  provider: string;
  difficulty: ResourceDifficulty;
  estimatedHours: number;
  category: LearningResourceCategory;
  url?: string;
}

export type CareerTimelinePhase =
  | "Current Position"
  | "Learning Phase"
  | "Project Building"
  | "Interview Ready"
  | "Target Role";

export interface CareerTimelineStop {
  id: string;
  phase: CareerTimelinePhase;
  label: string;
  estimate: string; // e.g. "Now", "Month 1-2"
  status: "complete" | "current" | "upcoming";
}

export type ProjectDifficulty = "Beginner" | "Intermediate" | "Advanced";

export interface ProjectRecommendation {
  id: string;
  title: string;
  difficulty: ProjectDifficulty;
  technologies: string[];
  estimatedTime: string;
  skillsCovered: string[];
}

export type CareerInsightType =
  | "biggest-strength"
  | "critical-gap"
  | "fastest-improvement"
  | "career-advice"
  | "interview-tip";

export interface CareerInsight {
  id: string;
  type: CareerInsightType;
  title: string;
  detail: string;
}

export type CareerReadinessStatus = "Needs Improvement" | "Almost Ready" | "Excellent Candidate";

/**
 * Full result of running a resume against a target role — the response
 * shape assumed for `POST /career/analyze`. One AI pipeline call returns
 * the whole nested report, same "big nested result" grammar as
 * `MatchResult` / `AtsScorecard`.
 */
export interface CareerRoadmapResult {
  id: string;
  resumeId: string;
  targetRole: string;
  careerReadinessScore: number; // 0-100
  readinessStatus: CareerReadinessStatus;
  estimatedTimeToTarget: string; // e.g. "4-6 months"
  skillGap: CareerSkillGapItem[];
  radarChartData: CareerRadarPoint[];
  roadmap: RoadmapStep[];
  certifications: Certification[];
  learningResources: LearningResource[];
  projectRecommendations: ProjectRecommendation[];
  careerTimeline: CareerTimelineStop[];
  insights: CareerInsight[];
  confidence: number;
  createdAt: string;
}

export interface AnalyzeCareerRoadmapPayload {
  resumeId: string;
  targetRole: string;
}
