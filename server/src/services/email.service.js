import nodemailer from "nodemailer";
import logger from "../utils/logger.js";

/**
 * Transactional Email Dispatcher Service
 * Integrates Nodemailer for production mail delivery, falling back to local console logs in development.
 */
export class EmailService {
  constructor() {
    this.from = process.env.FROM_EMAIL || "noreply@resumeiq.com";
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpHost = process.env.SMTP_HOST || "smtp.mailtrap.io";
    const smtpPort = parseInt(process.env.SMTP_PORT || "2525", 10);

    this.smtpHost = smtpHost;
    this.smtpPort = smtpPort;
    this.smtpUser = smtpUser;
    this.smtpPass = smtpPass;
    this.isPlaceholderTransport = !smtpUser || !smtpPass;
    this.allowFallback = process.env.NODE_ENV !== "production";

    if (!this.isPlaceholderTransport) {
      this.transporter = this.createSmtpTransport(smtpPort, smtpPort === 465);
    }
  }

  createSmtpTransport(port, secure = false) {
    return nodemailer.createTransport({
      host: this.smtpHost,
      port,
      secure,
      auth: { user: this.smtpUser, pass: this.smtpPass },
    });
  }

  async createEtherealTransport() {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  }

  async sendMail({ to, subject, html }) {
    let lastError = null;

    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({ from: this.from, to, subject, html });
        logger.info(`Email successfully sent to: ${to}. messageId=${info.messageId}`);
        return { info, previewUrl: null };
      } catch (error) {
        lastError = error;
        logger.warn(`Primary SMTP failed for ${to}: ${error?.message ?? error}.`);
      }
    }

    if (!this.isPlaceholderTransport && this.smtpPort !== 587 && this.smtpPort !== 465) {
      try {
        logger.info(`Retrying SMTP send on port 587 for ${to}.`);
        const fallbackTransporter = this.createSmtpTransport(587, false);
        const info = await fallbackTransporter.sendMail({ from: this.from, to, subject, html });
        logger.info(`Email successfully sent to: ${to} using fallback port 587. messageId=${info.messageId}`);
        return { info, previewUrl: null };
      } catch (error) {
        lastError = error;
        logger.warn(`Fallback SMTP port 587 failed for ${to}: ${error?.message ?? error}.`);
      }
    }

    if (!this.isPlaceholderTransport && this.smtpPort !== 465) {
      try {
        logger.info(`Retrying SMTP send on port 465 for ${to}.`);
        const secureTransporter = this.createSmtpTransport(465, true);
        const info = await secureTransporter.sendMail({ from: this.from, to, subject, html });
        logger.info(`Email successfully sent to: ${to} using fallback port 465. messageId=${info.messageId}`);
        return { info, previewUrl: null };
      } catch (error) {
        lastError = error;
        logger.warn(`Fallback SMTP port 465 failed for ${to}: ${error?.message ?? error}.`);
      }
    }

    if (this.allowFallback) {
      try {
        const etherealTransporter = await this.createEtherealTransport();
        const info = await etherealTransporter.sendMail({ from: this.from, to, subject, html });
        const previewUrl = nodemailer.getTestMessageUrl(info);
        logger.info(`Ethereal fallback email for ${to}: ${previewUrl}`);
        return { info, previewUrl };
      } catch (error) {
        lastError = error;
        logger.error(`Ethereal fallback failed for ${to}: ${error?.message ?? error}`);
      }
    }

    throw lastError || new Error("Unable to send email.");
  }

  async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${token}`;
    const subject = "Verify your ResumeIQ Account";

    // Log verification link clearly in the server logs/console
    logger.info(`\n==================================================\n[DEVELOPER INFO] Verification URL for ${email}:\n${verificationUrl}\n==================================================\n`);

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
      await this.sendMail({ to: email, subject, html });
      return true;
    } catch (error) {
      logger.error(`Failed to send verification email to: ${email}. Error: ${error?.message ?? error}`);
      return false;
    }
  }

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
      await this.sendMail({ to: email, subject, html });
      return true;
    } catch (error) {
      logger.error(`Failed to send password reset email to: ${email}. Error: ${error?.message ?? error}`);
      return false;
    }
  }
}

export default EmailService;
