import jwt from "jsonwebtoken";
import crypto from "crypto";
import { AppError } from "../utils/appError.js";

/**
 * Token and Session Management Service
 * Manages access token creation, refresh token rotation, and cookie configurations.
 */
export class TokenService {
  get accessTokenSecret() {
    return process.env.JWT_SECRET || "production_access_jwt_secret_token_key_6366f1_22d3ee";
  }

  get refreshTokenSecret() {
    return process.env.JWT_REFRESH_SECRET || "production_refresh_jwt_secret_token_key_4f46e5_10b981";
  }

  get accessTokenExpiry() {
    return process.env.JWT_EXPIRES_IN || "15m";
  }

  get refreshTokenExpiry() {
    return process.env.JWT_REFRESH_EXPIRES_IN || "7d";
  }

  /**
   * Generates a short-lived access JWT
   */
  generateAccessToken(user) {
    return jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      this.accessTokenSecret,
      { expiresIn: this.accessTokenExpiry }
    );
  }

  /**
   * Generates a long-lived refresh JWT
   */
  generateRefreshToken(user) {
    return jwt.sign(
      { id: user._id },
      this.refreshTokenSecret,
      { expiresIn: this.refreshTokenExpiry }
    );
  }

  /**
   * Hashes token string for secure database storage matching
   */
  hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  /**
   * Saves a new active refresh token session on the User document
   */
  async saveRefreshToken(user, token) {
    const hashed = this.hashToken(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Matches the 7d config

    user.activeRefreshTokens = Array.isArray(user.activeRefreshTokens) ? user.activeRefreshTokens : [];
    user.activeRefreshTokens.push({
      tokenHash: hashed,
      expiresAt
    });

    await user.save();
  }

  /**
   * Rotates an expired or active refresh token for new access credentials.
   * Cleans old token. Detects session hijacking if a reused refresh token is presented.
   */
  async rotateToken(user, oldToken) {
    const hashedOld = this.hashToken(oldToken);
    
    user.activeRefreshTokens = Array.isArray(user.activeRefreshTokens) ? user.activeRefreshTokens : [];

    // Check if the old token exists in the user's active session list
    const tokenIndex = user.activeRefreshTokens.findIndex(
      (t) => t.tokenHash === hashedOld
    );

    if (tokenIndex === -1) {
      // CRITICAL: Used token presented indicates session hijack attempt!
      // Clear all active sessions for this user as a security safeguard.
      user.activeRefreshTokens = [];
      await user.save();
      throw new AppError("Security alert: Session hijack or reuse detected. All sessions terminated.", 401);
    }

    // Remove the old token from active list
    user.activeRefreshTokens.splice(tokenIndex, 1);

    // Generate new token pair
    const newAccessToken = this.generateAccessToken(user);
    const newRefreshToken = this.generateRefreshToken(user);

    // Save the new refresh token session
    await this.saveRefreshToken(user, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  /**
   * Invalidates a specific refresh token session (Logout)
   */
  async invalidateToken(user, token) {
    const hashed = this.hashToken(token);
    user.activeRefreshTokens = Array.isArray(user.activeRefreshTokens) ? user.activeRefreshTokens : [];
    user.activeRefreshTokens = user.activeRefreshTokens.filter(
      (t) => t.tokenHash !== hashed
    );
    await user.save();
  }

  /**
   * Invalidates every stored refresh session for a user.
   */
  async invalidateAllTokens(user) {
    user.activeRefreshTokens = [];
    await user.save();
  }

  /**
   * Sets the HTTP-Only cookie header on the Express response
   */
  setCookie(res, token) {
    const isProd = process.env.NODE_ENV === "production";
    
    res.cookie("refreshToken", token, {
      httpOnly: true, // Safeguard against XSS reading token
      secure: isProd, // Sends only over HTTPS in production
      sameSite: "strict", // Safeguards against CSRF forgery
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days (in milliseconds)
    });
  }

  /**
   * Clears the session cookie header on logout
   */
  clearCookie(res) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });
  }
}

export default TokenService;
