import { validationResult } from "express-validator";
import { sendError } from "../utils/response.js";

/**
 * Express-Validator Interceptor Middleware
 * Evaluates request fields against predefined schemas before controllers run.
 */
export const validateFields = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return sendError(
      res,
      "Input validation failed. Please check the provided fields.",
      400,
      errorDetails
    );
  }

  next();
};

export default validateFields;
