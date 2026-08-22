import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { PortfolioController } from "../controllers/portfolio.controller.js";

const router = Router();
const controller = new PortfolioController();

router.use(protect);
router.post("/github/connect", controller.connectGitHub);
router.get("/github/:username/analysis", controller.getGitHubAnalysis);
router.post("/leetcode/connect", controller.connectLeetCode);

export default router;
