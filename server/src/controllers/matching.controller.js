import { MatchingService } from "../services/matching.service.js";
import { ResumeRepository } from "../repositories/resume.repository.js";
import { PdfService } from "../services/pdf.service.js";
import { sendSuccess } from "../utils/response.js";
import { AppError } from "../utils/appError.js";

const matchingService = new MatchingService();
const resumeRepository = new ResumeRepository();
const pdfService = new PdfService();

export class MatchingController {
  async analyzeJobMatch(req, res, next) {
    try {
      const { resumeId, jobDescription, jobTitle, company } = req.body;
      if (!resumeId || !jobDescription) {
        return next(new AppError("Resume ID and job description are required parameters.", 400));
      }

      const match = await matchingService.analyzeJobMatch(
        req.user._id,
        resumeId,
        jobDescription,
        jobTitle,
        company
      );

      return sendSuccess(res, "Job match analysis completed successfully.", { match }, 201);
    } catch (error) {
      next(error);
    }
  }

  async getMatchHistory(req, res, next) {
    try {
      const history = await matchingService.getHistory(req.user._id);
      return sendSuccess(res, "Job matching history loaded.", { history });
    } catch (error) {
      next(error);
    }
  }

  async getMatchDetails(req, res, next) {
    try {
      const match = await matchingService.getDetails(req.params.id, req.user._id);
      return sendSuccess(res, "Job match details loaded.", { match });
    } catch (error) {
      next(error);
    }
  }

  async saveMatchComparison(req, res, next) {
    try {
      const match = await matchingService.saveComparison(req.params.id, req.user._id);
      return sendSuccess(res, "Job comparison saved to dashboard list.", { match });
    } catch (error) {
      next(error);
    }
  }

  async deleteMatchComparison(req, res, next) {
    try {
      await matchingService.deleteComparison(req.params.id, req.user._id);
      return sendSuccess(res, "Job comparison deleted successfully.");
    } catch (error) {
      next(error);
    }
  }

  async downloadOptimizedResumePdf(req, res, next) {
    try {
      const match = await matchingService.getDetails(req.params.id, req.user._id);
      const resume = await resumeRepository.findByIdAndUser(match.resumeId, req.user._id);
      if (!resume) {
        return next(new AppError("Original resume not found.", 404));
      }

      pdfService.generateOptimizedResume(
        res,
        resume,
        match.matchedKeywords,
        match.missingKeywords,
        match.jobTitle
      );
    } catch (error) {
      next(error);
    }
  }

  async downloadGeneratedResumePdf(req, res, next) {
    try {
      const match = await matchingService.getDetails(req.params.id, req.user._id);
      pdfService.generateTailoredResume(res, match);
    } catch (error) {
      next(error);
    }
  }
}

export default MatchingController;
