/**
 * Mirrors the real object returned by `AtsEngine.evaluate()`
 * (server/src/ats/index.js) — not the earlier 4-field placeholder shape.
 */
export interface AtsBreakdownItem {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  reason: string;
  evidence: string[];
  suggestions: string[];
  confidence: number;
}

export interface AtsStrengthOrWeakness {
  id: string;
  name: string;
  message: string;
}

export interface AtsRadarPoint {
  subject: string;
  score: number;
  fullMark: number;
}

export interface AtsCategoryComparison {
  category: string;
  current: number;
  max: number;
  percentage: number;
}

export interface AtsVisualizationData {
  radarChartData: AtsRadarPoint[];
  categoryComparison: AtsCategoryComparison[];
  scoreTimeline: { phase: string; score: number }[];
}

export interface AtsScorecard {
  overallScore: number;
  breakdown: AtsBreakdownItem[];
  weakAreas: AtsStrengthOrWeakness[];
  strengths: AtsStrengthOrWeakness[];
  top10Improvements: string[];
  estimatedImprovedScore: number;
  confidence: number;
  atsVersion: string;
  timestamp: string;
  visualizationData: AtsVisualizationData;
}
