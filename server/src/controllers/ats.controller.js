import { AppError } from "../utils/appError.js";
import { ResumeRepository } from "../repositories/resume.repository.js";
import { AtsScoringService } from "../ats/services/atsScoringService.js";
import { RecruiterSimulationService } from "../ats/services/recruiterSimulationService.js";
import { sendSuccess } from "../utils/response.js";

const resumeRepository = new ResumeRepository();
const scoringService = new AtsScoringService();
const recruiterSimulationService = new RecruiterSimulationService();

export class AtsController {
  async analyzeResume(req, res, next) {
    try {
      const { resumeId, jobDescriptionId } = req.body;
      if (!resumeId) {
        return next(new AppError("resumeId is required.", 400));
      }

      const resume = await resumeRepository.findByIdAndUser(resumeId, req.user._id);
      if (!resume) {
        return next(new AppError("Requested resume not found or access unauthorized.", 404));
      }

      const parsedResumeText = resume.rawText || "";
      const jobDescription = "";
      const analysis = await scoringService.scoreResumeText(parsedResumeText, jobDescription);

      const scorecard = {
        overallScore: analysis.overall,
        breakdown: [
          {
            id: "formatting_quality",
            name: "Formatting",
            score: analysis.breakdown.formatting.score,
            maxScore: 100,
            reason: analysis.breakdown.formatting.reasons.join("; "),
            evidence: analysis.breakdown.formatting.reasons,
            suggestions: analysis.improvementSuggestions.filter((item) => item.toLowerCase().includes("format")),
            confidence: 0.85,
          },
          {
            id: "keyword_relevance",
            name: "Keywords",
            score: analysis.breakdown.keywords.score,
            maxScore: 100,
            reason: analysis.breakdown.keywords.reasons.join("; "),
            evidence: analysis.breakdown.keywords.reasons,
            suggestions: analysis.improvementSuggestions.filter((item) => item.toLowerCase().includes("keyword")),
            confidence: 0.9,
          },
          {
            id: "section_completeness",
            name: "Sections",
            score: analysis.breakdown.sections.score,
            maxScore: 100,
            reason: analysis.breakdown.sections.reasons.join("; "),
            evidence: analysis.breakdown.sections.reasons,
            suggestions: analysis.improvementSuggestions.filter((item) => item.toLowerCase().includes("section")),
            confidence: 0.8,
          },
          {
            id: "readability_quality",
            name: "Readability",
            score: analysis.breakdown.readability.score,
            maxScore: 100,
            reason: analysis.breakdown.readability.reasons.join("; "),
            evidence: analysis.breakdown.readability.reasons,
            suggestions: analysis.improvementSuggestions.filter((item) => item.toLowerCase().includes("readability")),
            confidence: 0.82,
          },
        ],
        weakAreas: [],
        strengths: [],
        top10Improvements: analysis.improvementSuggestions,
        estimatedImprovedScore: Math.min(100, analysis.overall + 8),
        confidence: 0.84,
        atsVersion: "ats-v1",
        timestamp: new Date().toISOString(),
        visualizationData: {
          radarChartData: [
            { subject: "Formatting", score: analysis.breakdown.formatting.score, fullMark: 100 },
            { subject: "Keywords", score: analysis.breakdown.keywords.score, fullMark: 100 },
            { subject: "Sections", score: analysis.breakdown.sections.score, fullMark: 100 },
            { subject: "Readability", score: analysis.breakdown.readability.score, fullMark: 100 },
          ],
          categoryComparison: [
            { category: "Formatting", current: analysis.breakdown.formatting.score, max: 100, percentage: analysis.breakdown.formatting.score },
            { category: "Keywords", current: analysis.breakdown.keywords.score, max: 100, percentage: analysis.breakdown.keywords.score },
            { category: "Sections", current: analysis.breakdown.sections.score, max: 100, percentage: analysis.breakdown.sections.score },
            { category: "Readability", current: analysis.breakdown.readability.score, max: 100, percentage: analysis.breakdown.readability.score },
          ],
          scoreTimeline: [],
        },
      };

      return sendSuccess(res, "ATS analysis generated.", {
        analysis: {
          scorecard,
          compatibilityReport: analysis.compatibilityReport,
          improvementSuggestions: analysis.improvementSuggestions,
          heatmap: [
            { section: "Formatting", score: analysis.breakdown.formatting.score, confidence: 0.85 },
            { section: "Keywords", score: analysis.breakdown.keywords.score, confidence: 0.9 },
            { section: "Sections", score: analysis.breakdown.sections.score, confidence: 0.8 },
            { section: "Readability", score: analysis.breakdown.readability.score, confidence: 0.82 },
          ],
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async simulateRecruiterReview(req, res, next) {
    try {
      const { resumeId, jobDescription = "" } = req.body;
      if (!resumeId) {
        return next(new AppError("resumeId is required.", 400));
      }

      const resume = await resumeRepository.findByIdAndUser(resumeId, req.user._id);
      if (!resume) {
        return next(new AppError("Requested resume not found or access unauthorized.", 404));
      }

      const simulation = await recruiterSimulationService.simulateRecruiterReview(resume.rawText || "", jobDescription);

      return sendSuccess(res, "Recruiter simulation generated.", { simulation });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req, res, next) {
    try {
      const resume = await resumeRepository.findByIdAndUser(req.params.resumeId, req.user._id);
      if (!resume) {
        return next(new AppError("Requested resume not found or access unauthorized.", 404));
      }

      const history = await resumeRepository.findHistoryByUserId(req.user._id);
      const points = history
        .filter((item) => item.atsScorecard)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .map((item) => ({ label: `v${item.version}`, score: item.atsScorecard.overallScore, date: item.createdAt }));

      return sendSuccess(res, "ATS history loaded.", { history: points });
    } catch (error) {
      next(error);
    }
  }
}

export default AtsController;
