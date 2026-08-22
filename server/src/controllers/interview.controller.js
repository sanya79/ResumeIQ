import { InterviewService } from "../services/interview.service.js";
import { ResumeRepository } from "../repositories/resume.repository.js";
import { sendSuccess } from "../utils/response.js";
import { AppError } from "../utils/appError.js";

const interviewService = new InterviewService();
const resumeRepository = new ResumeRepository();

export class InterviewController {
  async createInterviewSession(req, res, next) {
    try {
      const rawPayload = req.body || {};
      const payload = rawPayload.config ? { ...rawPayload.config, ...rawPayload } : rawPayload;

      const role = payload.role || payload.targetRole || payload.config?.targetRole || "Software Engineer";
      if (!role) {
        return next(new AppError("A role or target role is required to start an interview session.", 400));
      }

      let resumeId = payload.resumeId || payload.config?.resumeId || null;
      if (!resumeId) {
        const latestResume = await resumeRepository.findLatestByUserId(req.user._id);
        if (latestResume) {
          resumeId = latestResume._id.toString();
        }
      }

      const sessionPayload = {
        ...payload,
        role,
        resumeId,
      };

      const data = await interviewService.generateQuestions(req.user._id, sessionPayload);
      return sendSuccess(res, "Interview session created successfully.", data, 201);
    } catch (error) {
      next(error);
    }
  }

  async generateInterviewQuestions(req, res, next) {
    return this.createInterviewSession(req, res, next);
  }

  async submitInterviewAnswer(req, res, next) {
    try {
      const { id } = req.params;
      const { questionId, answerText, transcript, responseTimeSeconds, elapsedSeconds } = req.body;
      const answerValue = answerText ?? transcript;
      const responseTime = responseTimeSeconds ?? elapsedSeconds;

      if (!questionId || !answerValue || responseTime === undefined) {
        return next(new AppError("questionId, answerText or transcript, and responseTimeSeconds are required.", 400));
      }

      const result = await interviewService.submitAnswer(
        req.user._id,
        id,
        questionId,
        answerValue,
        responseTime
      );

      return sendSuccess(res, "Answer evaluated successfully.", result);
    } catch (error) {
      next(error);
    }
  }

  async finishInterviewSession(req, res, next) {
    try {
      const report = await interviewService.finishSession(req.user._id, req.params.id);
      return sendSuccess(res, "Interview session completed. Performance report compiled.", { report });
    } catch (error) {
      next(error);
    }
  }

  async completeInterviewSession(req, res, next) {
    return this.finishInterviewSession(req, res, next);
  }

  async getInterviewHistory(req, res, next) {
    try {
      const history = await interviewService.getHistory(req.user._id);
      return sendSuccess(res, "Mock interview sessions history loaded.", { history });
    } catch (error) {
      next(error);
    }
  }

  async getPastInterviewReport(req, res, next) {
    try {
      const report = await interviewService.getReportDetails(req.user._id, req.params.id);
      return sendSuccess(res, "Performance report loaded.", { report });
    } catch (error) {
      next(error);
    }
  }

  async getRecommendedPractice(req, res, next) {
    try {
      const recommendations = await interviewService.getPracticeRecommendations(req.user._id);
      return sendSuccess(res, "Recommended practice topics loaded.", { recommendations });
    } catch (error) {
      next(error);
    }
  }
}

export default InterviewController;
