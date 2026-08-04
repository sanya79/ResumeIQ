import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
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
router.get("/config", controller.getConfig);
router.post("/register", registerValidator, validateFields, controller.register);
router.post("/login", authLimiter, loginValidator, validateFields, controller.login);
router.post("/social-login", controller.socialLogin);
router.post("/refresh", controller.refresh);
router.post("/forgot-password", authLimiter, forgotPasswordValidator, validateFields, controller.forgotPassword);
router.post("/reset-password", authLimiter, resetPasswordValidator, validateFields, controller.resetPassword);
router.get("/verify-email", controller.verifyEmail);
router.post("/verify-email", controller.verifyEmail);

// Protected routes (Require JWT access token validation)
router.use(protect);
router.post("/resend-verification", controller.resendVerificationEmail);

router.post("/logout", controller.logout);
router.post("/change-password", changePasswordValidator, validateFields, controller.changePassword);
router.get("/me", controller.getCurrentUser);
router.get("/admin/health", restrictTo("Admin"), (req, res) => {
  return res.status(200).json({ success: true, message: "Admin access confirmed.", data: { role: req.user.role } });
});

export default router;
