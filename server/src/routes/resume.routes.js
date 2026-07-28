import { Router } from "express";
import { ResumeController } from "../controllers/resume.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();
const controller = new ResumeController();

// All resume operations are protected; require active user authentication
router.use(protect);

router.post("/upload", upload.single("resume"), controller.uploadResume);
router.get("/latest", controller.getLatestResume);
router.get("/history", controller.getResumeHistory);
router.get("/:id/optimized-pdf", controller.downloadOptimizedResumePdf);
router.get("/:id/report-pdf", controller.downloadReportPdf);
router.get("/:id", controller.getResumeDetails);
router.delete("/:id", controller.deleteResume);
router.post("/:id/restore", controller.restoreResumeVersion);

export default router;
