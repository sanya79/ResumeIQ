import { AppError } from "../utils/appError.js";
import { sendSuccess } from "../utils/response.js";
import { GitHubPortfolioService } from "../services/githubPortfolio.service.js";
import { LeetCodePortfolioService } from "../services/leetcodePortfolio.service.js";

const githubPortfolioService = new GitHubPortfolioService();
const leetcodePortfolioService = new LeetCodePortfolioService();

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

  async connectLeetCode(req, res, next) {
    try {
      const { leetcodeUsername } = req.body;
      if (!leetcodeUsername || !leetcodeUsername.trim()) {
        return next(new AppError("leetcodeUsername is required.", 400));
      }

      const analysis = await leetcodePortfolioService.connect(leetcodeUsername.trim());
      return sendSuccess(res, "LeetCode profile analyzed.", {
        analysis,
        leetcodeUsername: leetcodeUsername.trim(),
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
