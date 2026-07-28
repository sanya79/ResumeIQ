import { Router } from "express";
import authRoutes from "./auth.routes.js";
import resumeRoutes from "./resume.routes.js";
import careerRoutes from "./career.routes.js";
import matchingRoutes from "./matching.routes.js";
import interviewRoutes from "./interview.routes.js";

const router = Router();

// Mount feature-grouped route files
router.use("/auth", authRoutes);
router.use("/resumes", resumeRoutes);
router.use("/career", careerRoutes);
router.use("/matching", matchingRoutes);
router.use("/interview", interviewRoutes);

export default router;

