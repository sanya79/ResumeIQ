import jwt from "jsonwebtoken";
import { AppError } from "../utils/appError.js";
import { UserRepository } from "../repositories/user.repository.js";

const userRepository = new UserRepository();

function normalizeRoleValue(role) {
  return typeof role === "string" ? role.trim().toUpperCase() : "";
}

/**
 * Access Token Authentication Guard
 * Extracts Bearer token from headers, validates expiry, and sets user references.
 */
export const protect = async (req, res, next) => {
  let token;

  // Extract token from authorization headers
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(new AppError("Access denied. No authentication credentials token provided.", 401));
  }

  try {
    // Decode and verify the access token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "production_access_jwt_secret_token_key_6366f1_22d3ee");

    // Fetch the active user from repository layer
    const currentUser = await userRepository.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError("The user belonging to this active session token no longer exists.", 401));
    }

    // Attach user record to request scope
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Access credentials token expired. Please renew your session.", 401));
    }
    return next(new AppError("Invalid authentication credentials token. Access denied.", 401));
  }
};

/**
 * Role Authorization Guard
 * resticts route access to specified account roles
 * @param {...String} roles - Allowed roles list (e.g. 'Admin', 'Recruiter')
 */
export const restrictTo = (...roles) => {
  const allowedRoles = roles.map(normalizeRoleValue);

  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("You do not have permission to perform this action.", 403));
    }

    const userRole = normalizeRoleValue(req.user.role);
    if (!allowedRoles.includes(userRole)) {
      return next(new AppError("You do not have permission to perform this action.", 403));
    }
    next();
  };
};

export default {
  protect,
  restrictTo
};
