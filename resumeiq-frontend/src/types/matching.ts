/**
 * Job Matching Engine contract types.
 *
 * ⚠️ Same situation as `resume.api.ts` was in at scaffold time (see
 * README's "Backend contract assumption" note): no OpenAPI doc / matching
 * route file has been shared yet, so this shape is a reasonable inference
 * from the ATS engine's real `AtsScorecard` contract (types/ats.ts) —
 * same "0-100 score + maxScore + reason/evidence/suggestions" grammar,
 * extended with the job-matching-specific concepts (keyword priority,
 * skill gap, project relevance, hiring probability). Swap this out once
 * `server/src/routes/matching.routes.js` exists and its real response
 * shape is confirmed — nothing in the UI should need to change shape-wise
 * if the contract below turns out to be close.
 */

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  requiredSkills: string[];
  location: string;
}

export type MatchPriority = "High" | "Medium" | "Low";

export interface MatchKeyword {
  term: string;
  priority: MatchPriority;
  /** Why the engine assigned this priority/relevance — shown in a tooltip. */
  reason: string;
}

/**
 * One scored category of the match breakdown — Technical Skills, Soft
 * Skills, Projects, Experience, Education, Certifications, Keywords,
 * Responsibilities. Mirrors `AtsBreakdownItem`'s grammar exactly so the
 * same card/derivation patterns apply.
 */
export interface MatchCategoryScore {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  explanation: string;
  recommendation: string;
}

export interface SkillGapCategory {
  id: string;
  category: string;
  current: number;
  required: number;
  /** Individual skills the JD asks for that aren't evidenced on the resume. */
  missingItems: string[];
}

export interface ExperienceMatch {
  requiredYears: number;
  candidateYears: number;
  requiredLevel: string;
  candidateLevel: string;
  summary: string;
}

export interface ProjectRelevance {
  id: string;
  name: string;
  relevanceScore: number;
  matchingTechnologies: string[];
  matchingResponsibilities: string[];
  suggestions: string[];
}

export interface HiringProbability {
  interviewChance: number;
  atsRanking: number;
  recruiterInterest: number;
  applicationStrength: number;
}

export interface MatchRadarPoint {
  subject: string;
  score: number;
  fullMark: number;
}

export interface MatchKeywordDistributionPoint {
  category: string;
  matched: number;
  missing: number;
}

export interface MatchVisualizationData {
  radarChartData: MatchRadarPoint[];
  keywordDistribution: MatchKeywordDistributionPoint[];
}

/**
 * Full result of running a resume against a job description — the
 * response shape assumed for `POST /matching/analyze`.
 */
export interface MatchResult {
  id: string;
  jobId: string;
  resumeId: string;
  jobTitle: string;
  company: string;
  matchScore: number;
  matchedKeywords: MatchKeyword[];
  missingKeywords: MatchKeyword[];
  categoryBreakdown: MatchCategoryScore[];
  skillGap: SkillGapCategory[];
  experienceMatch: ExperienceMatch;
  projectRelevance: ProjectRelevance[];
  recommendations: string[];
  hiringProbability: HiringProbability;
  visualizationData: MatchVisualizationData;
  confidence: number;
  isSaved: boolean;
  createdAt: string;
}

/** Lightweight row for the saved-comparisons list (`GET /matching/history`). */
export interface SavedMatchComparison {
  id: string;
  jobTitle: string;
  company: string;
  matchScore: number;
  resumeId: string;
  createdAt: string;
}

export interface AnalyzeJobMatchPayload {
  resumeId: string;
  jobDescription: string;
  jobTitle?: string;
  company?: string;
}
