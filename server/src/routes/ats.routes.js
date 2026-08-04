import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { AtsController } from "../controllers/ats.controller.js";

const router = Router();
const controller = new AtsController();

router.use(protect);
router.post("/analyze", controller.analyzeResume);
router.post("/simulate-recruiter", controller.simulateRecruiterReview);
router.get("/history/:resumeId", controller.getHistory);

export default router;
