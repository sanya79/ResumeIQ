import type {
  CareerReadinessStatus,
  CareerInsightType,
  LearningResource,
  LearningResourceCategory,
  ResourceDifficulty,
  RoadmapStep,
} from "@/types";

/**
 * Everything derived here is a view over the real `CareerRoadmapResult`
 * returned by `POST /career/analyze` — no network calls, no invented
 * data. Where the UI wants a concept the contract doesn't literally
 * provide (a tone color for a status, a grouped-by-category resource
 * map), the derivation is a documented heuristic on the real
 * field/number, exactly like `pages/matching/data.ts` and `pages/ats/data.ts`.
 */

export interface TargetRoleOption {
  value: string;
  label: string;
  group: string;
}

/** Static target-role catalogue. Adding a new role only ever means adding
 * a row here — nothing else in the selector needs to change. */
export const targetRoles: TargetRoleOption[] = [
  { value: "frontend-developer", label: "Frontend Developer", group: "Engineering" },
  { value: "backend-developer", label: "Backend Developer", group: "Engineering" },
  { value: "full-stack-developer", label: "Full Stack Developer", group: "Engineering" },
  { value: "mobile-developer", label: "Mobile Developer (iOS/Android/Flutter)", group: "Engineering" },
  { value: "qa-engineer", label: "QA & Test Automation Engineer", group: "Engineering" },
  { value: "software-architect", label: "Software Architect", group: "Engineering" },
  { value: "embedded-engineer", label: "Embedded Systems Engineer", group: "Engineering" },
  { value: "ai-engineer", label: "AI & GenAI Engineer", group: "Data & AI" },
  { value: "machine-learning-engineer", label: "Machine Learning Engineer", group: "Data & AI" },
  { value: "data-scientist", label: "Data Scientist", group: "Data & AI" },
  { value: "data-engineer", label: "Data Engineer", group: "Data & AI" },
  { value: "data-analyst", label: "Data Analyst", group: "Data & AI" },
  { value: "devops-engineer", label: "DevOps Engineer", group: "Infrastructure & Security" },
  { value: "cloud-architect", label: "Cloud Architect", group: "Infrastructure & Security" },
  { value: "cyber-security-analyst", label: "Cyber Security Analyst", group: "Infrastructure & Security" },
  { value: "site-reliability-engineer", label: "Site Reliability Engineer (SRE)", group: "Infrastructure & Security" },
  { value: "product-manager", label: "Product Manager", group: "Product & Management" },
  { value: "project-manager", label: "Project Manager / Scrum Master", group: "Product & Management" },
  { value: "business-analyst", label: "Business Analyst", group: "Product & Management" },
  { value: "ui-ux-designer", label: "UI/UX Designer", group: "Design & Content" },
  { value: "content-writer", label: "Content Writer & Copywriter", group: "Design & Content" },
  { value: "digital-marketing", label: "Digital Marketing Specialist", group: "Marketing & Growth" },
  { value: "sales-manager", label: "Sales & Account Executive", group: "Marketing & Growth" },
  { value: "hr-manager", label: "HR Manager & Talent Acquisition", group: "Operations & HR" },
  { value: "financial-analyst", label: "Financial Analyst", group: "Operations & HR" },
  { value: "operations-manager", label: "Operations Manager", group: "Operations & HR" },
];

export function getReadinessTone(status: CareerReadinessStatus): "emerald" | "cyan" | "pink" {
  if (status === "Excellent Candidate") return "emerald";
  if (status === "Almost Ready") return "cyan";
  return "pink";
}

export function getReadinessColor(status: CareerReadinessStatus): string {
  if (status === "Excellent Candidate") return "#10B981";
  if (status === "Almost Ready") return "#22D3EE";
  return "#EC4899";
}

export function getDifficultyTone(difficulty: string): "emerald" | "cyan" | "pink" {
  if (difficulty === "Beginner") return "emerald";
  if (difficulty === "Intermediate") return "cyan";
  return "pink";
}

export function getPriorityTone(priority: string): "purple" | "cyan" | "neutral" {
  if (priority === "High") return "purple";
  if (priority === "Medium") return "cyan";
  return "neutral";
}

export function getGapSeverity(current: number, required: number): "none" | "minor" | "major" {
  if (current >= required) return "none";
  const ratio = required > 0 ? current / required : 1;
  if (ratio >= 0.7) return "minor";
  return "major";
}

export const insightMeta: Record<CareerInsightType, { label: string; tone: "emerald" | "pink" | "cyan" | "purple" }> = {
  "biggest-strength": { label: "Biggest Strength", tone: "emerald" },
  "critical-gap": { label: "Most Critical Skill Gap", tone: "pink" },
  "fastest-improvement": { label: "Fastest Improvement Area", tone: "cyan" },
  "career-advice": { label: "Career Advice", tone: "purple" },
  "interview-tip": { label: "Interview Preparation Tip", tone: "purple" },
};

/** Groups the flat resource list into the five category buckets the UI
 * renders as separate card rows, preserving backend order within each. */
export function groupResourcesByCategory(
  resources: LearningResource[]
): Partial<Record<LearningResourceCategory, LearningResource[]>> {
  return resources.reduce<Partial<Record<LearningResourceCategory, LearningResource[]>>>((acc, resource) => {
    const bucket = acc[resource.category] ?? [];
    bucket.push(resource);
    acc[resource.category] = bucket;
    return acc;
  }, {});
}

export const resourceCategoryOrder: LearningResourceCategory[] = [
  "Courses",
  "Videos",
  "Books",
  "Practice Platforms",
  "Documentation",
];

export function getRoadmapProgress(steps: RoadmapStep[]): { completed: number; total: number; percent: number } {
  const total = steps.length;
  const completed = steps.filter((s) => s.status === "completed").length;
  return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
}

export function difficultyRank(difficulty: ResourceDifficulty): number {
  return difficulty === "Beginner" ? 0 : difficulty === "Intermediate" ? 1 : 2;
}
