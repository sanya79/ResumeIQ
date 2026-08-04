import { AppError } from "../utils/appError.js";
import { sendSuccess } from "../utils/response.js";
import { GitHubPortfolioService } from "../services/githubPortfolio.service.js";

const githubPortfolioService = new GitHubPortfolioService();

export class PortfolioController {
  async connectGitHub(req, res, next) {
    try {
      const { githubUsername } = req.body;
      if (!githubUsername || !githubUsername.trim()) {
        return next(new AppError("githubUsername is required.", 400));
      }

      const analysis = await githubPortfolioService.connect(githubUsername.trim());
      return sendSuccess(res, "GitHub profile analyzed.", {
        analysis,
        githubUsername: githubUsername.trim(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getGitHubAnalysis(req, res, next) {
    try {
      const analysis = await githubPortfolioService.connect(req.params.username);
      return sendSuccess(res, "GitHub portfolio analysis loaded.", { analysis });
    } catch (error) {
      next(error);
    }
  }
}

export default PortfolioController;
