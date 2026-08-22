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

import passport from "passport";

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
router.post("/resend-verification", controller.resendVerificationEmail);
router.post("/dev-verify-account", controller.devVerifyAccount);

// Helper to check if OAuth client IDs are valid production credentials
const isRealGoogleId = (id) => Boolean(id && !id.startsWith("dummy") && !id.includes("your_google") && id.includes(".apps.googleusercontent.com"));
const isRealGithubId = (id) => Boolean(id && !id.startsWith("dummy") && !id.includes("your_github") && id.length >= 10);

const getDefaultFrontendUrl = () => {
  const fallback = process.env.NODE_ENV === "production" ? "https://resumeiq-frontend1.onrender.com" : "http://localhost:5173";
  return (process.env.FRONTEND_URL || fallback).replace(/\/$/, "");
};

// Passport OAuth Routes
router.get("/google", (req, res, next) => {
  const redirectUri = req.query.redirect_uri || `${getDefaultFrontendUrl()}/login`;
  const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
  
  if (!isRealGoogleId(googleClientId)) {
    return res.redirect(`${redirectUri}?social_fallback=google`);
  }

  passport.authenticate("google", { 
    scope: ["profile", "email"],
    state: "google",
    session: false,
    accessType: "offline"
  })(req, res, next);
});

router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user, info) => {
      if (err || !user) {
        const redirectUri = `${getDefaultFrontendUrl()}/login`;
        return res.redirect(`${redirectUri}?social_fallback=google`);
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  controller.oauthCallback
);

router.get("/github", (req, res, next) => {
  const redirectUri = req.query.redirect_uri || `${getDefaultFrontendUrl()}/login`;
  const githubClientId = process.env.GITHUB_CLIENT_ID || "";

  if (!isRealGithubId(githubClientId)) {
    return res.redirect(`${redirectUri}?social_fallback=github`);
  }

  passport.authenticate("github", { 
    scope: ["user:email"],
    state: "github",
    session: false
  })(req, res, next);
});

router.get(
  "/github/callback",
  (req, res, next) => {
    passport.authenticate("github", { session: false }, (err, user, info) => {
      if (err || !user) {
        const redirectUri = `${getDefaultFrontendUrl()}/login`;
        return res.redirect(`${redirectUri}?social_fallback=github`);
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  controller.oauthCallback
);

// Protected routes (Require JWT access token validation)
router.use(protect);

router.post("/logout", controller.logout);
router.post("/change-password", changePasswordValidator, validateFields, controller.changePassword);
router.get("/me", controller.getCurrentUser);
router.get("/admin/health", restrictTo("Admin"), (req, res) => {
  return res.status(200).json({ success: true, message: "Admin access confirmed.", data: { role: req.user.role } });
});

export default router;
