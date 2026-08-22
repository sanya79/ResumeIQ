import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import passport from "passport";
import "./config/passport.js";
import { apiLimiter } from "./middleware/rateLimiter.middleware.js";
import routes from "./routes/index.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { AppError } from "./utils/appError.js";
import { sendSuccess } from "./utils/response.js";

const app = express();

// 1. Inject Security HTTP headers (Helmet)
app.use(helmet());

// 2. Configure Cross-Origin Resource Sharing (CORS)
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const allowedOrigins = [
  frontendUrl,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];
const isLocalhostDev = (origin) => {
  try {
    const host = new URL(origin).hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
};
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin) || (process.env.NODE_ENV !== "production" && isLocalhostDev(origin))) {
        callback(null, true);
      } else {
        callback(new Error("Blocked by CORS security policies."));
      }
    },
    credentials: true, // Allow session cookies to transfer
  })
);

// 3. Request Logging (Morgan)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// 4. Request parsing and NoSQL injection defenses
app.use(express.json({ limit: "15kb" })); // Limit payload sizes to block overflow attacks
app.use(express.urlencoded({ extended: true, limit: "15kb" }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(mongoSanitize()); // Blocks query parameter selector modifications

// 5. Global API Rate Limiter
app.use("/api", apiLimiter);

// 6. Mount Application Routes
app.use("/api/v1", routes);

// 7. Health check endpoint
app.get("/", (req, res) => {
  return sendSuccess(res, "ResumeIQ API is running");
});

// 8. Fallback route for unmapped paths (404)
app.all("*", (req, res, next) => {
  next(new AppError(`Cannot find requested route ${req.originalUrl} on this server.`, 404));
});

// 8. Global Error Handler Middleware
app.use(errorMiddleware);

export default app;
