import { ResumeRepository } from "../repositories/resume.repository.js";
import { PipelineService } from "../services/pipeline.service.js";
import { PdfService } from "../services/pdf.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { AppError } from "../utils/appError.js";

const resumeRepository = new ResumeRepository();
const pipelineService = new PipelineService();

/**
 * Controller mapping HTTP routes to Resume upload & version actions
 */
export class ResumeController {
  /**
   * Uploads and runs parsing-scoring pipeline
   */
  async uploadResume(req, res, next) {
    try {
      if (!req.file) {
        return next(new AppError("Please select a resume file (PDF or DOCX) to upload.", 400));
      }

      const { uploadSource } = req.body;
      const userId = req.user._id;

      // Delegate upload handling and calculations to pipeline service
      const resumeRecord = await pipelineService.processUpload(
        userId,
        req.file,
        uploadSource
      );

      return sendSuccess(
        res,
        "Resume uploaded and analyzed successfully.",
        { resume: resumeRecord },
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Loads the current active latest resume copy
   */
  async getLatestResume(req, res, next) {
    try {
      const latest = await resumeRepository.findLatestByUserId(req.user._id);
      if (!latest) {
        return sendSuccess(res, "No resumes uploaded yet.", null);
      }
      return sendSuccess(res, "Latest resume loaded.", { resume: latest });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Loads full upload history and older versions list
   */
  async getResumeHistory(req, res, next) {
    try {
      const history = await resumeRepository.findHistoryByUserId(req.user._id);
      return sendSuccess(res, "Resume upload history loaded.", { history });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gets specific details and scorecard of a resume file
   */
  async getResumeDetails(req, res, next) {
    try {
      const resume = await resumeRepository.findByIdAndUser(req.params.id, req.user._id);
      if (!resume) {
        return next(new AppError("Requested resume not found or access unauthorized.", 404));
      }
      return sendSuccess(res, "Resume details loaded.", { resume });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Performs soft deletion on a file
   */
  async deleteResume(req, res, next) {
    try {
      const deleted = await resumeRepository.softDelete(req.params.id, req.user._id);
      if (!deleted) {
        return next(new AppError("Requested resume not found or access unauthorized.", 404));
      }
      return sendSuccess(res, "Resume deleted successfully.");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Restores an older version as the active candidate layout
   */
  async restoreResumeVersion(req, res, next) {
    try {
      const restored = await resumeRepository.restoreVersion(req.params.id, req.user._id);
      if (!restored) {
        return next(new AppError("Requested resume version not found or access unauthorized.", 404));
      }
      return sendSuccess(res, "Resume version successfully restored as active.", { resume: restored });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generates and downloads the ATS report PDF
   */
  async downloadReportPdf(req, res, next) {
    try {
      const resume = await resumeRepository.findByIdAndUser(req.params.id, req.user._id);
      if (!resume || !resume.atsScorecard) {
        return next(new AppError("Requested resume or scorecard not found.", 404));
      }

      const pdfService = new PdfService();
      pdfService.generateAtsReport(res, resume.atsScorecard, resume.originalName);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generates an optimized resume PDF tailored to the latest ATS analysis.
   */
  async downloadOptimizedResumePdf(req, res, next) {
    try {
      const resume = await resumeRepository.findByIdAndUser(req.params.id, req.user._id);
      if (!resume) {
        return next(new AppError("Requested resume not found or access unauthorized.", 404));
      }

      const keywordItem = (resume.atsScorecard?.breakdown || []).find((item) => item.id === "keyword_relevance");
      const matchedKeywords = (keywordItem?.evidence || []).flatMap((entry) => {
        const terms = [...entry.matchAll(/'([^']+)'/g)].map((match) => match[1].trim()).filter(Boolean);
        return terms.map((term) => ({ term, priority: "Medium", reason: "Detected in your existing resume content." }));
      });

      const missingKeywords = (keywordItem?.suggestions || []).flatMap((entry) => {
        const terms = [...entry.matchAll(/'([^']+)'/g)].map((match) => match[1].trim()).filter(Boolean);
        return terms.map((term) => ({ term, priority: "Medium", reason: "Suggested by ATS analysis to strengthen your resume." }));
      });

      const pdfService = new PdfService();
      pdfService.generateOptimizedResume(
        res,
        resume,
        matchedKeywords,
        missingKeywords,
        req.query.jobTitle || "target role"
      );
    } catch (error) {
      next(error);
    }
  }
}

export default ResumeController;
