import logger from "../utils/logger.js";
import { sendError } from "../utils/response.js";

/**
 * Global Express Error Middleware
 * Catches all bubble-up errors, normalizes Mongoose/JWT exceptions,
 * logs failures, and returns structured JSON responses.
 */
export const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Log error stack trace internally using Winston
  logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip} \nStack: ${err.stack}`);

  // Handle specific database and auth engine exception types
  let error = { ...err };
  error.message = err.message;

  // 1. Mongoose bad ObjectId casting error
  if (err.name === "CastError") {
    const msg = `Invalid resource locator: ${err.path}: ${err.value}.`;
    return sendError(res, msg, 400);
  }

  // 2. Mongoose Duplicate Key index conflict
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const msg = `Duplicate field value entered: '${err.keyValue[field]}'. Please use another value for field '${field}'.`;
    return sendError(res, msg, 409);
  }

  // 3. Mongoose Validation Errors
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((el) => el.message);
    const msg = `Validation failed: ${errors.join(". ")}`;
    return sendError(res, msg, 400, errors);
  }

  // 4. JWT Authorization errors
  if (err.name === "JsonWebTokenError") {
    return sendError(res, "Invalid access credentials token. Please log in again.", 401);
  }

  if (err.name === "TokenExpiredError") {
    return sendError(res, "Access credentials token expired. Please renew your session.", 401);
  }

  // 5. Multer file size / upload errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return sendError(res, "Uploaded file size exceeds the allowed limit (10MB).", 400);
  }

  // Production vs. Development feedback density
  if (process.env.NODE_ENV === "development") {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err.message,
      stack: err.stack,
    });
  }

  // Safe operational error return
  if (err.isOperational) {
    return sendError(res, err.message, err.statusCode);
  }

  // Internal server fallback
  return sendError(res, "An unexpected internal server error occurred.", 500);
};

export default errorMiddleware;
