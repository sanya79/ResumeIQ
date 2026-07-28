import { AuthService } from "../services/auth.service.js";
import { TokenService } from "../services/token.service.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { AppError } from "../utils/appError.js";

const authService = new AuthService();
const tokenService = new TokenService();

/**
 * Controller mapping HTTP paths to Authentication Service Methods
 */
export class AuthController {
  async register(req, res, next) {
    try {
      const { fullName, name, email, password, role } = req.body;
      const data = await authService.register(fullName || name, email, password, role);

      tokenService.setCookie(res, data.refreshToken);

      return sendSuccess(
        res,
        "Registration successful. Please check your email for verification link.",
        {
          user: { ...data.user, name: data.user.fullName || data.user.name || name || "User" },
          accessToken: data.accessToken,
          refreshToken: data.refreshToken
        },
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const ip = req.ip || req.connection.remoteAddress;
      const ua = req.headers["user-agent"] || "unknown";

      const data = await authService.login(email, password, ip, ua);

      // Inject Refresh Token into secure HTTP-Only cookie
      tokenService.setCookie(res, data.refreshToken);

      return sendSuccess(res, "Login successful.", {
        user: { ...data.user, name: data.user.fullName || data.user.name || "User" },
        accessToken: data.accessToken,
        refreshToken: data.refreshToken
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      
      // Invalidate the session
      if (req.user) {
        await authService.logout(req.user, refreshToken);
      }

      // Clear cookie header
      tokenService.clearCookie(res);

      return sendSuccess(res, "Logout successful.");
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const token = req.cookies.refreshToken || req.body.refreshToken;
      if (!token) {
        return next(new AppError("Refresh session token missing. Please log in again.", 401));
      }

      // Execute session rotation
      const data = await authService.refreshSession(token);

      // Set rotated refresh cookie
      tokenService.setCookie(res, data.refreshToken);

      return sendSuccess(res, "Session refreshed successfully.", {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);
      
      // Return success regardless of existence to prevent email scraping
      return sendSuccess(res, "If the account exists, a password reset link has been dispatched.");
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);
      
      return sendSuccess(res, "Password reset successful. Please login with your new credentials.");
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const { token } = req.query;
      if (!token) {
        return next(new AppError("Verification token parameter missing.", 400));
      }

      await authService.verifyEmail(token);
      
      return sendSuccess(res, "Email verified successfully! Your account is active.");
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.user, currentPassword, newPassword);

      // Clear refresh cookies
      tokenService.clearCookie(res);

      return sendSuccess(res, "Password changed successfully. Other active sessions terminated. Please login again.");
    } catch (error) {
      next(error);
    }
  }

  getCurrentUser(req, res) {
    const profile = {
      id: req.user._id,
      fullName: req.user.fullName,
      name: req.user.fullName,
      email: req.user.email,
      role: req.user.role,
      emailVerified: req.user.emailVerified,
      resumeCredits: req.user.resumeCredits,
      subscriptionPlan: req.user.subscriptionPlan,
      createdAt: req.user.createdAt
    };

    return sendSuccess(res, "User profile loaded.", { user: profile });
  }
}

export default AuthController;
