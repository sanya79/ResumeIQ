export const APP_NAME = "ResumeIQ";

/** The Vite dev server proxies /api to the backend, while production can
 * override with VITE_API_URL or VITE_API_BASE_URL if the API lives elsewhere. */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

/** Local storage keys — centralized to avoid magic strings across the app. */
export const STORAGE_KEYS = {
  accessToken: "resumeiq_access_token",
  refreshToken: "resumeiq_refresh_token",
} as const;
