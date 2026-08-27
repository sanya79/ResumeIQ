import { Router } from "express";
import { ResumeController } from "../controllers/resume.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();
const controller = new ResumeController();

// All resume operations are protected; require active user authentication
router.use(protect);

router.post("/", upload.single("resume"), controller.uploadResume);
router.post("/upload", upload.single("resume"), controller.uploadResume);
router.get("/", controller.getResumeList);
router.get("/latest", controller.getLatestResume);
router.get("/history", controller.getResumeHistory);
router.get("/compare", controller.compareResumeVersions);
router.get("/:id/versions", controller.getResumeVersions);
router.post("/:id/optimize", controller.optimizeResume);
router.get("/:id/chat", controller.getChatHistory);
router.post("/:id/chat", controller.chatWithResume);
router.get("/:id/knowledge-graph", controller.getKnowledgeGraph);
router.get("/:id/optimizations", controller.getOptimizations);
router.post("/:id/apply-optimization", controller.applyOptimization);
router.get("/:id/optimized-pdf", controller.downloadOptimizedResumePdf);
router.get("/:id/report-pdf", controller.downloadReportPdf);
router.get("/:id", controller.getResumeDetails);
router.delete("/:id", controller.deleteResume);
router.post("/:id/restore", controller.restoreResumeVersion);

export default router;
