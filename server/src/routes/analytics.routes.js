import { Router } from "express";
import { AnalyticsController } from "../controllers/analytics.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();
const controller = new AnalyticsController();

router.use(protect);
router.get("/overview", controller.getOverview);

export default router;
