export const APP_NAME = "ResumeIQ";

/** Real backend mounts all routes under /api/v1 and defaults to port 5000
 * (see server/src/app.js + server.js). Override via VITE_API_BASE_URL for
 * other environments. */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1";

/** Local storage keys — centralized to avoid magic strings across the app. */
export const STORAGE_KEYS = {
  accessToken: "resumeiq_access_token",
  refreshToken: "resumeiq_refresh_token",
} as const;
