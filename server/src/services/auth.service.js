import crypto from "crypto";
import { AppError } from "../utils/appError.js";
import { UserRepository } from "../repositories/user.repository.js";
import { TokenService } from "./token.service.js";
import { EmailService } from "./email.service.js";

const userRepository = new UserRepository();
const tokenService = new TokenService();
const emailService = new EmailService();

/**
 * Authentication Business Logic Service
 * Orchestrates user sessions, security updates, and email notifications.
 */
export class AuthService {
  /**
   * Registers a new user account
   */
  async register(fullName, email, password, role = "Recruiter") {
    // Check for duplicate account registrations
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new AppError("An account with this email address already exists.", 409);
    }

    // Generate email verification token (active for 24 hours)
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Save the new user record
    const user = await userRepository.createUser({
      fullName,
      email,
      passwordHash: password, // Mongoose pre-save hook will hash this
      role,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires
    });

    // Send email verification notification
    await emailService.sendVerificationEmail(user.email, verificationToken);

    const accessToken = tokenService.generateAccessToken(user);
    const refreshToken = tokenService.generateRefreshToken(user);
    await tokenService.saveRefreshToken(user, refreshToken);

    return {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        resumeCredits: user.resumeCredits,
        subscriptionPlan: user.subscriptionPlan
      },
      accessToken,
      refreshToken
    };
  }

  /**
   * Authenticates user credentials
   */
  async login(email, password, ipAddress, userAgent) {
    const user = await userRepository.findByEmail(email);
    
    // Verify user exists and credentials are correct
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError("Invalid email or password. Access denied.", 401);
    }

    // Log this login session in the history log
    user.lastLogin = new Date();
    user.loginHistory = Array.isArray(user.loginHistory) ? user.loginHistory : [];
    user.loginHistory.push({
      timestamp: new Date(),
      ipAddress,
      userAgent
    });

    // Generate access & refresh tokens
    const accessToken = tokenService.generateAccessToken(user);
    const refreshToken = tokenService.generateRefreshToken(user);

    // Save refresh token session in database
    await tokenService.saveRefreshToken(user, refreshToken);

    return {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        resumeCredits: user.resumeCredits,
        subscriptionPlan: user.subscriptionPlan
      },
      accessToken,
      refreshToken
    };
  }

  /**
   * Ends user session, invalidating the refresh token
   */
  async logout(user, refreshToken) {
    if (refreshToken) {
      await tokenService.invalidateToken(user, refreshToken);
    }
  }

  /**
   * Refreshes access tokens using refresh token rotation
   */
  async refreshSession(refreshToken) {
    if (!refreshToken) {
      throw new AppError("Session refresh token missing. Access denied.", 400);
    }

    try {
      // Decode and verify the refresh token
      const decoded = jwtVerifySecret(refreshToken, process.env.JWT_REFRESH_SECRET || "production_refresh_jwt_secret_token_key_4f46e5_10b981");
      
      const user = await userRepository.findById(decoded.id);
      if (!user) {
        throw new AppError("The user belonging to this session token no longer exists.", 401);
      }

      // Rotate token values
      const rotated = await tokenService.rotateToken(user, refreshToken);
      return rotated;
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError("Invalid or expired session refresh token.", 401);
    }
  }

  /**
   * Initiates forgot password flow
   */
  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Security best practice: Do not disclose if email exists
      return;
    }

    // Generate 1-hour reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000);
    await userRepository.save(user);

    // Send reset email notification
    await emailService.sendPasswordResetEmail(user.email, resetToken);
  }

  /**
   * Resets password using valid token
   */
  async resetPassword(token, newPassword) {
    const user = await userRepository.findByResetToken(token);
    if (!user) {
      throw new AppError("Invalid or expired password reset token.", 400);
    }

    // Update password fields
    user.passwordHash = newPassword; // Hashes via hook on save
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // Terminate all existing sessions on password change as a security precaution
    user.activeRefreshTokens = [];

    await userRepository.save(user);
  }

  /**
   * Verifies email using verification token
   */
  async verifyEmail(token) {
    const user = await userRepository.findByVerificationToken(token);
    if (!user) {
      throw new AppError("Invalid or expired email verification token.", 400);
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await userRepository.save(user);
  }

  /**
   * Changes user password
   */
  async changePassword(user, currentPassword, newPassword) {
    // Verify current password match
    if (!(await user.comparePassword(currentPassword))) {
      throw new AppError("Current password entered is incorrect.", 401);
    }

    user.passwordHash = newPassword; // Hashes on save
    user.activeRefreshTokens = []; // Terminate other sessions
    await userRepository.save(user);
  }
}

// Utility helper to handle JWT verify inside async flows
function jwtVerifySecret(token, secret) {
  try {
    return jwt.verify(token, secret);
  } catch (e) {
    throw new AppError("JWT verification failed.", 401);
  }
}

import jwt from "jsonwebtoken";

export default AuthService;
