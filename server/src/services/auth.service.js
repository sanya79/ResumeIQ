import crypto from "crypto";
import { AppError } from "../utils/appError.js";
import { UserRepository } from "../repositories/user.repository.js";
import { TokenService } from "./token.service.js";
import { EmailService } from "./email.service.js";

const normalizeRole = (role) => {
  const rawRole = typeof role === "string" ? role.trim() : "";
  if (!rawRole) return "CANDIDATE";

  const normalized = rawRole.toUpperCase();
  if (normalized === "ADMIN") return "ADMIN";
  if (normalized === "RECRUITER") return "RECRUITER";
  return "CANDIDATE";
};

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
  async register(fullName, email, password, role = "Candidate") {
    const normalizedRole = normalizeRole(role);
    const displayName = String(fullName || email.split("@")[0] || "User").trim();

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const isVerificationRequired = process.env.EMAIL_VERIFICATION_REQUIRED === "true";

    // Check for duplicate account registrations
    let user = await userRepository.findByEmail(email);

    if (user) {
      if (user.emailVerified) {
        throw new AppError("An account with this email address already exists. Please log in instead.", 409);
      }
      // If user exists but is unverified, update their details & send a fresh verification email
      user.fullName = displayName;
      user.passwordHash = password; // Mongoose pre-save hook will hash this
      user.role = normalizedRole;
      user.emailVerificationToken = verificationToken;
      user.emailVerificationExpires = verificationExpires;
      await userRepository.save(user);
    } else {
      // Save the new user record
      user = await userRepository.createUser({
        fullName: displayName,
        email,
        passwordHash: password, // Mongoose pre-save hook will hash this
        role: normalizedRole,
        emailVerified: !isVerificationRequired,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires
      });
    }

    // Send email verification notification asynchronously
    emailService.sendVerificationEmail(user.email, verificationToken)
      .catch((err) => console.error("Failed to send verification email:", err));

    const accessToken = tokenService.generateAccessToken(user);
    const refreshToken = tokenService.generateRefreshToken(user);
    await tokenService.saveRefreshToken(user, refreshToken);

    const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${verificationToken}`;

    return {
      user: {
        id: user._id,
        fullName: user.fullName,
        name: user.fullName,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        isEmailVerified: user.emailVerified,
        resumeCredits: user.resumeCredits,
        subscriptionPlan: user.subscriptionPlan
      },
      accessToken,
      refreshToken,
      verificationUrl: verificationUrl
    };
  }

  /**
   * Authenticates user credentials
   */
  async socialLogin(provider, payload = {}) {
    const normalizedProvider = String(provider || "").trim().toUpperCase();
    let email = payload.email;
    let fullName = payload.fullName || payload.name;
    let avatarUrl = payload.avatarUrl || payload.avatar;

    if (!["GOOGLE", "GITHUB"].includes(normalizedProvider)) {
      throw new AppError("Unsupported social provider. Use Google or GitHub.", 400);
    }

    // Check if OAuth authorization code is provided for exchange
    if (payload.code) {
      if (normalizedProvider === "GOOGLE") {
        const client_id = process.env.GOOGLE_CLIENT_ID;
        const client_secret = process.env.GOOGLE_CLIENT_SECRET;
        if (client_id && client_secret && !client_id.startsWith("dummy") && !client_id.startsWith("your_")) {
          try {
            const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({
                code: payload.code,
                client_id,
                client_secret,
                redirect_uri: payload.redirectUri,
                grant_type: "authorization_code",
              }),
            });

            if (tokenResponse.ok) {
              const tokens = await tokenResponse.json();
              const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${tokens.access_token}` },
              });
              if (userResponse.ok) {
                const profile = await userResponse.json();
                email = profile.email;
                fullName = profile.name;
                avatarUrl = profile.picture;
              }
            }
          } catch (err) {
            console.warn("Google OAuth exchange fallback:", err.message);
          }
        }
      } else if (normalizedProvider === "GITHUB") {
        const client_id = process.env.GITHUB_CLIENT_ID;
        const client_secret = process.env.GITHUB_CLIENT_SECRET;
        if (client_id && client_secret && !client_id.startsWith("dummy") && !client_id.startsWith("your_")) {
          try {
            const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                code: payload.code,
                client_id,
                client_secret,
                redirect_uri: payload.redirectUri,
              }),
            });

            if (tokenResponse.ok) {
              const tokens = await tokenResponse.json();
              if (tokens.access_token) {
                const userResponse = await fetch("https://api.github.com/user", {
                  headers: {
                    Authorization: `Bearer ${tokens.access_token}`,
                    "User-Agent": "ResumeIQ-Server",
                  },
                });

                if (userResponse.ok) {
                  const profile = await userResponse.json();
                  fullName = profile.name || profile.login;
                  avatarUrl = profile.avatar_url;
                  email = profile.email;

                  if (!email) {
                    const emailsResponse = await fetch("https://api.github.com/user/emails", {
                      headers: {
                        Authorization: `Bearer ${tokens.access_token}`,
                        "User-Agent": "ResumeIQ-Server",
                      },
                    });

                    if (emailsResponse.ok) {
                      const emailsList = await emailsResponse.json();
                      const primaryEmail = emailsList.find((e) => e.primary) || emailsList[0];
                      if (primaryEmail) {
                        email = primaryEmail.email;
                      }
                    }
                  }
                }
              }
            }
          } catch (err) {
            console.warn("GitHub OAuth exchange fallback:", err.message);
          }
        }
      }
    }

    email = String(email || "").trim().toLowerCase();
    fullName = String(fullName || "").trim();

    if (!email) {
      email = `${normalizedProvider.toLowerCase()}_demo@resumeiq.com`;
    }
    if (!fullName) {
      fullName = `${normalizedProvider === "GOOGLE" ? "Google" : "GitHub"} User`;
    }

    const providerId = `${normalizedProvider}:${email}`;
    let user = await userRepository.findByProvider(normalizedProvider, providerId);

    if (!user) {
      user = await userRepository.findByEmail(email);
    }

    if (!user) {
      user = await userRepository.createUser({
        fullName,
        email,
        passwordHash: crypto.randomBytes(24).toString("hex"),
        authProvider: normalizedProvider,
        providerId,
        avatar: avatarUrl || "",
        role: normalizeRole(payload.role || "Candidate"),
        emailVerified: true
      });
    } else {
      user.authProvider = normalizedProvider;
      user.providerId = providerId;
      user.avatar = avatarUrl || user.avatar || "";
      user.emailVerified = true;
      if (!user.fullName) user.fullName = fullName;
      await userRepository.save(user);
    }

    const accessToken = tokenService.generateAccessToken(user);
    const refreshToken = tokenService.generateRefreshToken(user);
    await tokenService.saveRefreshToken(user, refreshToken);

    return {
      user: {
        id: user._id,
        fullName: user.fullName,
        name: user.fullName,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        isEmailVerified: user.emailVerified,
        resumeCredits: user.resumeCredits,
        subscriptionPlan: user.subscriptionPlan
      },
      accessToken,
      refreshToken
    };
  }

  async login(email, password, ipAddress, userAgent) {
    const user = await userRepository.findByEmail(email);
    
    // Verify user exists and credentials are correct
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError("Invalid email or password. Access denied.", 401);
    }

    // Enforce email verification before granting a full session
    if (!user.emailVerified) {
      if (process.env.EMAIL_VERIFICATION_REQUIRED === "false") {
        user.emailVerified = true;
        await userRepository.save(user);
      } else {
        throw new AppError("Please verify your email address before logging in.", 403);
      }
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
        name: user.fullName,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        isEmailVerified: user.emailVerified,
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
    } else {
      await tokenService.invalidateAllTokens(user);
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

  async resendVerificationEmail(userOrEmail) {
    let user;
    if (typeof userOrEmail === "string") {
      user = await userRepository.findByEmail(userOrEmail);
    } else if (userOrEmail?.email) {
      user = await userRepository.findByEmail(userOrEmail.email);
    } else {
      user = userOrEmail;
    }

    if (!user) {
      throw new AppError("Account not found with this email address.", 404);
    }

    if (user.emailVerified) {
      return { success: true, message: "Email is already verified." };
    }

    if (!user.emailVerificationToken || !user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
      user.emailVerificationToken = crypto.randomBytes(32).toString("hex");
      user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await userRepository.save(user);
    }

    // Send email verification notification asynchronously so it doesn't block the request
    emailService.sendVerificationEmail(user.email, user.emailVerificationToken)
      .catch((err) => console.error("Failed to resend verification email:", err));

    const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${user.emailVerificationToken}`;

    return {
      success: true,
      verificationUrl: process.env.NODE_ENV === "development" ? verificationUrl : undefined
    };
  }

  async devVerifyAccount(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError("User not found with this email address.", 404);
    }
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await userRepository.save(user);
    return { success: true, message: "Account email verified successfully." };
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
