import type { AtsBreakdownItem, AtsScorecard, Resume } from "@/types";

/**
 * Everything in this file is a *derived view* of real data already returned
 * by the backend (`atsScorecard` on a `Resume`, or the resume-history list).
 * Nothing here calls a network endpoint or invents data the engine doesn't
 * provide. Where the source data genuinely doesn't include a concept the
 * dashboard UI wants (e.g. a literal keyword "importance" tier, or a
 * recruiter percentile rank), the derivation is a documented heuristic —
 * flagged in the function's comment — not a real backend statistic.
 */

// ---------------------------------------------------------------------------
// Score status / verdict
// ---------------------------------------------------------------------------

export type ScoreTier = "Excellent" | "Strong" | "Fair" | "Needs Work";

export function getScoreTier(score: number): ScoreTier {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Strong";
  if (score >= 50) return "Fair";
  return "Needs Work";
}

/**
 * The backend doesn't return a peer-percentile. This buckets the real score
 * into a qualitative band rather than presenting a fabricated precise
 * percentile (e.g. "Top 12%") as if it were a real statistic.
 */
export function getEstimatedRankBand(score: number): string {
  if (score >= 85) return "Top tier";
  if (score >= 70) return "Above average";
  if (score >= 50) return "Average";
  return "Below average";
}

export function isJobReady(score: number): boolean {
  return score >= 70;
}

// ---------------------------------------------------------------------------
// Score breakdown trend (real, when a previous version exists)
// ---------------------------------------------------------------------------

export interface BreakdownTrend {
  delta: number | null; // null when there's no previous version to compare
  direction: "up" | "down" | "flat" | "new";
}

/** Compares a breakdown item's score against the same category (matched by
 * id) in the immediately previous resume version — real delta, not a guess. */
export function getBreakdownTrend(item: AtsBreakdownItem, previousScorecard: AtsScorecard | null): BreakdownTrend {
  if (!previousScorecard) return { delta: null, direction: "new" };
  const previousItem = previousScorecard.breakdown.find((b) => b.id === item.id);
  if (!previousItem) return { delta: null, direction: "new" };

  const delta = item.score - previousItem.score;
  return { delta, direction: delta > 0 ? "up" : delta < 0 ? "down" : "flat" };
}

// ---------------------------------------------------------------------------
// Keyword analysis — derived from the "keyword_relevance" breakdown item
// ---------------------------------------------------------------------------

export type KeywordImportance = "High" | "Medium" | "Low";

export interface DerivedKeyword {
  term: string;
  importance: KeywordImportance;
}

/**
 * The engine returns `evidence` (keywords it found) and `suggestions`
 * (keywords/phrases it recommends adding) for the keyword-relevance
 * category, but no explicit importance tier per keyword. Importance here
 * is derived from list position — the engine already orders both arrays by
 * relevance — rather than inventing a separate scoring dimension.
 */
export function deriveImportance(index: number, total: number): KeywordImportance {
  if (total <= 1) return "High";
  const position = index / (total - 1);
  if (position <= 0.34) return "High";
  if (position <= 0.67) return "Medium";
  return "Low";
}

export function findKeywordBreakdownItem(breakdown: AtsBreakdownItem[]): AtsBreakdownItem | undefined {
  return breakdown.find((item) => item.id === "keyword_relevance");
}

export function toDerivedKeywords(terms: string[]): DerivedKeyword[] {
  return terms.map((term, i) => ({ term, importance: deriveImportance(i, terms.length) }));
}

// ---------------------------------------------------------------------------
// ATS problems — derived from weakAreas, severity inferred from the matching
// breakdown category's score percentage (real score, bucketed).
// ---------------------------------------------------------------------------

export type ProblemSeverity = "Critical" | "Warning" | "Minor";

export function getSeverity(percentage: number | null): ProblemSeverity {
  if (percentage === null) return "Warning";
  if (percentage < 40) return "Critical";
  if (percentage < 70) return "Warning";
  return "Minor";
}

export function getBreakdownPercentage(item: AtsBreakdownItem): number {
  return item.maxScore > 0 ? Math.round((item.score / item.maxScore) * 100) : 0;
}

// ---------------------------------------------------------------------------
// Heatmap
// ---------------------------------------------------------------------------

export type HeatLevel = "strong" | "average" | "weak";

export function getHeatLevel(percentage: number): HeatLevel {
  if (percentage >= 75) return "strong";
  if (percentage >= 45) return "average";
  return "weak";
}

// ---------------------------------------------------------------------------
// Score history (from real resume version history)
// ---------------------------------------------------------------------------

export interface ScoreHistoryPoint {
  label: string;
  score: number;
  date: string;
}

/** Chronological score-over-time series from real resume versions —
 * only versions that finished analysis (have a scorecard) are included. */
export function buildScoreHistory(history: Resume[]): ScoreHistoryPoint[] {
  return [...history]
    .filter((r) => r.atsScorecard)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((r) => ({
      label: `v${r.version}`,
      score: r.atsScorecard!.overallScore,
      date: r.createdAt,
    }));
}

/** Most recent completed version and the one immediately before it, for
 * the before/after comparison view. Both come straight from real history. */
export function getComparisonPair(history: Resume[]): { previous: Resume | null; current: Resume | null } {
  const completed = [...history]
    .filter((r) => r.atsScorecard)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return { current: completed[0] ?? null, previous: completed[1] ?? null };
}
