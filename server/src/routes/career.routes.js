import { Router } from "express";
import { CareerController } from "../controllers/career.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();
const controller = new CareerController();

// Require auth verification
router.use(protect);

router.post("/analyze", controller.analyzeCareerRoadmap);
router.patch("/:resultId/roadmap/:stepId", controller.updateRoadmapStepStatus);

export default router;
