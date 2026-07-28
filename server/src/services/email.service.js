import nodemailer from "nodemailer";
import logger from "../utils/logger.js";

/**
 * Transactional Email Dispatcher Service
 * Integrates Nodemailer for production mail delivery, falling back to local console logs in development.
 */
export class EmailService {
  constructor() {
    this.from = process.env.FROM_EMAIL || "noreply@resumeiq.com";

    // Create a basic transporter from env vars if provided. Some local
    // development setups intentionally use placeholder values; fall back
    // to an Ethereal test account to produce a real previewable message
    // rather than silently logging a token.
    const smtpUser = process.env.SMTP_USER || "dummy_user";
    const smtpPass = process.env.SMTP_PASS || "dummy_pass";
    const smtpHost = process.env.SMTP_HOST || "smtp.mailtrap.io";
    const smtpPort = parseInt(process.env.SMTP_PORT || "2525", 10);

    // If placeholders are present, do not assume a working external SMTP
    // — we'll create and use an Ethereal test account at send-time so that
    // developers can open a preview link and validate email contents.
    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      auth: { user: smtpUser, pass: smtpPass },
    });
  }

  /**
   * Dispatches email verification link
   */
  async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${token}`;
    const subject = "Verify your ResumeIQ Account";
    
    const html = `
      <div style="font-family: sans-serif; padding: 20px; max-width: 600px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #6366f1;">Welcome to ResumeIQ!</h2>
        <p>Thank you for signing up. Please click the button below to verify your email address and activate your account:</p>
        <div style="margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
        </div>
        <p style="font-size: 12px; color: #666;">If you did not sign up for this account, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #999;">Or copy and paste this link in your browser: <br/> ${verificationUrl}</p>
      </div>
    `;

    try {
      // If running with placeholder SMTP credentials, use Ethereal to
      // create a real previewable message instead of silently logging.
      if (process.env.SMTP_USER === "dummy_smtp_username" || process.env.SMTP_USER === "dummy_user") {
        const testAccount = await nodemailer.createTestAccount();
        const testTransporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          auth: { user: testAccount.user, pass: testAccount.pass },
        });

        const info = await testTransporter.sendMail({ from: this.from, to: email, subject, html });
        const previewUrl = nodemailer.getTestMessageUrl(info);
        logger.info(`[Ethereal Preview] Verification email for ${email}: ${previewUrl}`);
        return true;
      }

      const info = await this.transporter.sendMail({ from: this.from, to: email, subject, html });
      // If a non-placeholder SMTP is configured, log success + any returned id
      logger.info(`Verification email successfully sent to: ${email}. messageId=${info.messageId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send verification email to: ${email}. Error: ${error?.message ?? error}`);
      return false;
    }
  }

  /**
   * Dispatches password reset link
   */
  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${token}`;
    const subject = "Reset your ResumeIQ Password";

    const html = `
      <div style="font-family: sans-serif; padding: 20px; max-width: 600px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #6366f1;">Reset Password Request</h2>
        <p>We received a request to reset your password. Click the button below to choose a new one. This link will expire in 1 hour:</p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="font-size: 12px; color: #666;">If you did not request a password change, please ignore this request or contact support.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #999;">Or copy and paste this link in your browser: <br/> ${resetUrl}</p>
      </div>
    `;

    try {
      if (process.env.SMTP_USER === "dummy_smtp_username" || process.env.SMTP_USER === "dummy_user") {
        const testAccount = await nodemailer.createTestAccount();
        const testTransporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          auth: { user: testAccount.user, pass: testAccount.pass },
        });

        const info = await testTransporter.sendMail({ from: this.from, to: email, subject, html });
        const previewUrl = nodemailer.getTestMessageUrl(info);
        logger.info(`[Ethereal Preview] Password reset email for ${email}: ${previewUrl}`);
        return true;
      }

      const info = await this.transporter.sendMail({ from: this.from, to: email, subject, html });
      logger.info(`Password reset email successfully sent to: ${email}. messageId=${info.messageId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send password reset email to: ${email}. Error: ${error?.message ?? error}`);
      return false;
    }
  }
}

export default EmailService;
