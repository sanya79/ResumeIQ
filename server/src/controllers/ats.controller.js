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
      const { resumeId, jobDescription: reqJobDescription, jobDescriptionText, targetRole } = req.body;
      if (!resumeId) {
        return next(new AppError("resumeId is required.", 400));
      }

      const resume = await resumeRepository.findByIdAndUser(resumeId, req.user._id);
      if (!resume) {
        return next(new AppError("Requested resume not found or access unauthorized.", 404));
      }

      const jobDescription = (reqJobDescription || jobDescriptionText || "").trim();
      const resumeInput = resume.parsedProfile && Object.keys(resume.parsedProfile).length > 0 ? resume.parsedProfile : resume.rawText || "";

      const analysis = await scoringService.scoreResumeText(resumeInput, jobDescription, targetRole);
      const scorecard = analysis.scorecard;

      // Update resume record with the new accurate scorecard
      resume.atsScorecard = scorecard;
      await resume.save();

      return sendSuccess(res, "ATS analysis generated.", {
        analysis: {
          scorecard,
          compatibilityReport: analysis.compatibilityReport,
          improvementSuggestions: analysis.improvementSuggestions,
          heatmap: scorecard.breakdown.map((b) => ({
            section: b.name,
            score: b.maxScore > 0 ? Math.round((b.score / b.maxScore) * 100) : 0,
            confidence: b.confidence || 0.9,
          })),
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
