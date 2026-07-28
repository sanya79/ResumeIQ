import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/rateLimiter.middleware.js";
import { validateFields } from "../middleware/validation.middleware.js";
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator
} from "../validators/auth.validator.js";

const router = Router();
const controller = new AuthController();

// Public routes (Rate limited to block brute-force attempts)
router.post("/register", registerValidator, validateFields, controller.register);
router.post("/login", authLimiter, loginValidator, validateFields, controller.login);
router.post("/refresh", controller.refresh);
router.post("/forgot-password", authLimiter, forgotPasswordValidator, validateFields, controller.forgotPassword);
router.post("/reset-password", authLimiter, resetPasswordValidator, validateFields, controller.resetPassword);
router.get("/verify-email", controller.verifyEmail);

// Protected routes (Require JWT access token validation)
router.use(protect);

router.post("/logout", controller.logout);
router.post("/change-password", changePasswordValidator, validateFields, controller.changePassword);
router.get("/me", controller.getCurrentUser);

export default router;
