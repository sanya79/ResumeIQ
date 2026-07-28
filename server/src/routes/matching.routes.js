import { Router } from "express";
import { MatchingController } from "../controllers/matching.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();
const controller = new MatchingController();

// Require auth verification
router.use(protect);

router.post("/analyze", controller.analyzeJobMatch);
router.get("/history", controller.getMatchHistory);
router.get("/:id", controller.getMatchDetails);
router.post("/:id/save", controller.saveMatchComparison);
router.delete("/:id", controller.deleteMatchComparison);

// PDF Outputs
router.get("/:id/optimize-pdf", controller.downloadOptimizedResumePdf);
router.get("/:id/generate-pdf", controller.downloadGeneratedResumePdf);

export default router;
