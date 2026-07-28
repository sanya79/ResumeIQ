import { Router } from "express";
import { InterviewController } from "../controllers/interview.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();
const controller = new InterviewController();

// Require auth verification
router.use(protect);

router.post("/questions", controller.generateInterviewQuestions);
router.post("/sessions/:id/answer", controller.submitInterviewAnswer);
router.post("/sessions/:id/complete", controller.completeInterviewSession);
router.get("/history", controller.getInterviewHistory);
router.get("/history/:id", controller.getPastInterviewReport);
router.get("/recommendations", controller.getRecommendedPractice);

export default router;
