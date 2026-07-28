import { rulesConfig } from "./config/rules.config.js";
import SectionScorer from "./modules/section.scorer.js";
import KeywordScorer from "./modules/keyword.scorer.js";
import ExperienceScorer from "./modules/experience.scorer.js";
import ProjectScorer from "./modules/project.scorer.js";
import FormattingScorer from "./modules/formatting.scorer.js";
import ReadabilityScorer from "./modules/readability.scorer.js";
import ImpactScorer from "./modules/impact.scorer.js";
import LeadershipScorer from "./modules/leadership.scorer.js";
import EducationScorer from "./modules/education.scorer.js";
import CertificationScorer from "./modules/certification.scorer.js";

/**
 * ResumeIQ Explainable ATS Intelligence Engine
 * Orchestrates scoring, aggregates breakdown reports, calculates progress vectors, 
 * and prioritizes actionable improvement feedback.
 */
export class AtsEngine {
  constructor() {
    // Map rule IDs to their corresponding scorer classes
    this.scorersMap = {
      section_completeness: new SectionScorer(),
      keyword_relevance: new KeywordScorer(),
      experience_quality: new ExperienceScorer(),
      project_quality: new ProjectScorer(),
      formatting_quality: new FormattingScorer(),
      readability_quality: new ReadabilityScorer(),
      impact_metrics: new ImpactScorer(),
      leadership_indicators: new LeadershipScorer(),
      education_quality: new EducationScorer(),
      certification_quality: new CertificationScorer()
    };
  }

  /**
   * Evaluates parsed resume JSON and returns a detailed ATS scorecard
   * @param {Object} parsedData - The structured JSON parsed from the resume file.
   * @param {Object} context - Optional evaluation settings (e.g. targetRole, industry).
   * @returns {Object} Full scorecard JSON with score, breakdown, visual datasets, and improvements.
   */
  async evaluate(parsedData, context = {}) {
    const activeRules = rulesConfig.rules.filter(r => r.enabled);
    const breakdown = [];
    
    let totalScore = 0;
    let totalWeight = 0;
    let confidenceSum = 0;
    
    // Execute all active scorer rules
    for (const rule of activeRules) {
      const scorer = this.scorersMap[rule.id];
      if (!scorer) {
        continue;
      }

      try {
        const result = await scorer.score(parsedData, rule, context);
        
        breakdown.push({
          id: result.id,
          name: result.name,
          score: result.score,
          maxScore: result.maxScore,
          reason: result.reason,
          evidence: result.evidence || [],
          suggestions: result.suggestions || [],
          confidence: result.confidence || 1.0
        });

        totalScore += result.score;
        totalWeight += result.maxScore;
        confidenceSum += result.confidence || 1.0;
      } catch (error) {
        console.error(`Error executing ATS scoring module for rule ${rule.id}:`, error);
        // Fail-safe: Award 0 points but do not crash the evaluation run
        breakdown.push({
          id: rule.id,
          name: rule.name,
          score: 0,
          maxScore: rule.weight,
          reason: "Scoring module execution failed during run.",
          evidence: [],
          suggestions: ["Re-upload resume to trigger evaluation again."],
          confidence: 0.0
        });
        totalWeight += rule.weight;
      }
    }

    // Normalize final score to a scale of 0-100 (in case active rules do not sum to 100)
    let overallScore = 0;
    if (totalWeight > 0) {
      overallScore = Math.round((totalScore / totalWeight) * 100);
    }

    // Determine overall strengths and weak areas
    const strengths = [];
    const weakAreas = [];
    const improvementsQueue = [];

    breakdown.forEach(item => {
      const scoreRatio = item.maxScore > 0 ? item.score / item.maxScore : 0;
      
      if (scoreRatio >= 0.85) {
        strengths.push({
          id: item.id,
          name: item.name,
          message: `${item.name} is strong (${Math.round(scoreRatio * 100)}%).`
        });
      } else if (scoreRatio < 0.70) {
        weakAreas.push({
          id: item.id,
          name: item.name,
          message: `${item.name} needs improvement (${Math.round(scoreRatio * 100)}%).`
        });
      }

      // Collect suggestions to build the global improvements list
      (item.suggestions || []).forEach(suggestion => {
        improvementsQueue.push({
          ruleId: item.id,
          ruleName: item.name,
          suggestion,
          potentialGain: item.maxScore - item.score
        });
      });
    });

    // Prioritize and extract the top 10 improvements based on potential score gains
    improvementsQueue.sort((a, b) => b.potentialGain - a.potentialGain);
    const top10Improvements = improvementsQueue.slice(0, 10).map(item => item.suggestion);

    // Calculate potential improved score if user addresses top suggestions
    // Standard estimation: Resolve up to 75% of the score gaps for addressed rules
    let potentialGainSum = 0;
    const rulesAddressed = new Set();
    improvementsQueue.slice(0, 5).forEach(item => {
      if (!rulesAddressed.has(item.ruleId)) {
        potentialGainSum += item.potentialGain;
        rulesAddressed.add(item.ruleId);
      }
    });

    const estimatedImprovedScore = Math.min(100, overallScore + Math.round(potentialGainSum * 0.75));

    // Calculate overall scoring run confidence
    const overallConfidence = activeRules.length > 0 ? Math.round((confidenceSum / activeRules.length) * 100) / 100 : 1.0;

    // Generate chart data structures (Radar Chart & Category Comparison)
    const radarChartData = breakdown.map(item => ({
      subject: item.name,
      score: item.score,
      fullMark: item.maxScore
    }));

    const categoryComparison = breakdown.map(item => ({
      category: item.name,
      current: item.score,
      max: item.maxScore,
      percentage: item.maxScore > 0 ? Math.round((item.score / item.maxScore) * 100) : 0
    }));

    return {
      overallScore,
      breakdown,
      weakAreas,
      strengths,
      top10Improvements,
      estimatedImprovedScore,
      confidence: overallConfidence,
      atsVersion: rulesConfig.version,
      timestamp: new Date().toISOString(),
      visualizationData: {
        radarChartData,
        categoryComparison,
        scoreTimeline: [
          { phase: "Initial Upload", score: overallScore },
          { phase: "After Top 5 Edits", score: estimatedImprovedScore }
        ]
      }
    };
  }
}
export default AtsEngine;
