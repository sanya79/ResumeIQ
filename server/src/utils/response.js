/**
 * Standardized API Response Wrappers
 * Enforces uniform payload structures across all endpoints.
 */

/**
 * Sends a structured success response to the client
 * @param {Object} res - Express response object
 * @param {String} message - User-friendly confirmation message
 * @param {Object|Array} data - Payload data returnable to the client
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
export const sendSuccess = (res, message, data = null, statusCode = 200) => {
  const payload = {
    success: true,
    message,
  };

  if (data !== null) {
    payload.data = data;
  }

  return res.status(statusCode).json(payload);
};

/**
 * Sends a structured error response to the client
 * @param {Object} res - Express response object
 * @param {String} message - Error details message
 * @param {Number} statusCode - HTTP status code (default: 500)
 * @param {Array} details - Additional error arrays (e.g., validation rules checks)
 */
export const sendError = (res, message, statusCode = 500, details = null) => {
  const payload = {
    success: false,
    message,
    error: message,
  };

  if (details !== null) {
    payload.errors = details;
  }

  return res.status(statusCode).json(payload);
};

export default {
  sendSuccess,
  sendError
};
