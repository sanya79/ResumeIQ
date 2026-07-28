import type { MatchPriority } from "@/types";

/**
 * Everything here is a derived view of the real `MatchResult` returned by
 * `POST /matching/analyze` — no network calls, no invented data. Where the
 * UI wants a concept the contract doesn't literally provide (a verdict
 * label for a 0-100 score, a tone color for a priority tier), the
 * derivation is a documented heuristic on the real number/field, exactly
 * like `pages/ats/data.ts`.
 */

export type MatchTier = "Excellent Match" | "Good Match" | "Average Match" | "Poor Match";

export function getMatchTier(score: number): MatchTier {
  if (score >= 85) return "Excellent Match";
  if (score >= 70) return "Good Match";
  if (score >= 50) return "Average Match";
  return "Poor Match";
}

export function getMatchTierColor(score: number): string {
  if (score >= 85) return "#10B981";
  if (score >= 70) return "#22D3EE";
  if (score >= 50) return "#8B5CF6";
  return "#EC4899";
}

export function getMatchTierTone(score: number): "emerald" | "cyan" | "purple" | "pink" {
  if (score >= 85) return "emerald";
  if (score >= 70) return "cyan";
  if (score >= 50) return "purple";
  return "pink";
}

export const priorityTone: Record<MatchPriority, "purple" | "cyan" | "neutral"> = {
  High: "purple",
  Medium: "cyan",
  Low: "neutral",
};

export function getCategoryPercentage(score: number, maxScore: number): number {
  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

export function getGapSeverity(current: number, required: number): "none" | "minor" | "major" {
  if (current >= required) return "none";
  const ratio = required > 0 ? current / required : 1;
  if (ratio >= 0.7) return "minor";
  return "major";
}

/** Experience-years comparison bucketed into a plain-language verdict —
 * derived from the two real numbers in `ExperienceMatch`. */
export function getExperienceVerdict(candidateYears: number, requiredYears: number): string {
  if (requiredYears <= 0) return "No specific experience requirement detected";
  const delta = candidateYears - requiredYears;
  if (delta >= 2) return "Exceeds requirement";
  if (delta >= 0) return "Meets requirement";
  if (delta >= -1) return "Slightly under requirement";
  return "Below requirement";
}
