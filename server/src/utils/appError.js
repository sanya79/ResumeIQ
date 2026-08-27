/**
 * Standard Operational Error Wrapper
 * Distinguishes expected operational errors (e.g., validations, auth failures) 
 * from unexpected runtime/programming exceptions.
 */
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode || 500;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // Signals that this error is safe to return to the client

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
