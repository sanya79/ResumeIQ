import { InterviewService } from "../services/interview.service.js";
import { sendSuccess } from "../utils/response.js";
import { AppError } from "../utils/appError.js";

const interviewService = new InterviewService();

export class InterviewController {
  async generateInterviewQuestions(req, res, next) {
    try {
      const { config } = req.body;
      if (!config || !config.targetRole || !config.difficulty || !config.experienceLevel || !config.type) {
        return next(new AppError("Complete interview config object is required.", 400));
      }

      const data = await interviewService.generateQuestions(req.user._id, config);
      return sendSuccess(res, "Mock interview session and questions generated.", data, 201);
    } catch (error) {
      next(error);
    }
  }

  async submitInterviewAnswer(req, res, next) {
    try {
      const { id } = req.params;
      const { questionId, answerText, responseTimeSeconds } = req.body;

      if (!questionId || !answerText || responseTimeSeconds === undefined) {
        return next(new AppError("questionId, answerText, and responseTimeSeconds are required.", 400));
      }

      const evaluation = await interviewService.submitAnswer(
        req.user._id,
        id,
        questionId,
        answerText,
        responseTimeSeconds
      );

      return sendSuccess(res, "Answer evaluated successfully.", { evaluation });
    } catch (error) {
      next(error);
    }
  }

  async completeInterviewSession(req, res, next) {
    try {
      const report = await interviewService.completeSession(req.user._id, req.params.id);
      return sendSuccess(res, "Mock interview session completed. Performance report compiled.", { report });
    } catch (error) {
      next(error);
    }
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
