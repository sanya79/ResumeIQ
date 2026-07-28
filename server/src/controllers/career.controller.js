import { CareerService } from "../services/career.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { AppError } from "../utils/appError.js";

const careerService = new CareerService();

export class CareerController {
  async analyzeCareerRoadmap(req, res, next) {
    try {
      const { resumeId, targetRole } = req.body;
      if (!resumeId || !targetRole) {
        return next(new AppError("Resume ID and target role are required parameters.", 400));
      }

      const roadmap = await careerService.analyzeRoadmap(req.user._id, resumeId, targetRole);

      return sendSuccess(res, "Career roadmap analysis completed successfully.", { roadmap }, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateRoadmapStepStatus(req, res, next) {
    try {
      const { resultId, stepId } = req.params;
      const { status } = req.body;

      if (!status) {
        return next(new AppError("Step status parameter is required.", 400));
      }

      const updatedRoadmap = await careerService.updateStepStatus(req.user._id, resultId, stepId, status);

      return sendSuccess(res, "Roadmap step status updated successfully.", { roadmap: updatedRoadmap });
    } catch (error) {
      next(error);
    }
  }
}

export default CareerController;
