import { body } from "express-validator";

/**
 * Authentication Input Validation Schemas
 * Express-validator checks executed before controller actions.
 */
export const registerValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email address is required")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  body("role")
    .optional()
    .trim()
    .isIn(["Recruiter", "Admin", "Candidate", "recruiter", "admin", "candidate"])
    .withMessage("Invalid account role specified")
];

export const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email address is required")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
];

export const forgotPasswordValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email address is required")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail()
];

export const resetPasswordValidator = [
  body("token")
    .notEmpty()
    .withMessage("Reset token is required"),

  body("password")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
];

export const changePasswordValidator = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long")
];

export default {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator
};
