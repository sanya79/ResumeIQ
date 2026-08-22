export const APP_NAME = "ResumeIQ";

function getSanitizedApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL;
  if (!envUrl || !envUrl.trim()) {
    return "/api/v1";
  }
  const cleanUrl = envUrl.trim().replace(/\/+$/, "");
  if (!cleanUrl.endsWith("/api/v1")) {
    return `${cleanUrl}/api/v1`;
  }
  return cleanUrl;
}

export const API_BASE_URL = getSanitizedApiBaseUrl();

/** Local storage keys — centralized to avoid magic strings across the app. */
export const STORAGE_KEYS = {
  accessToken: "resumeiq_access_token",
  refreshToken: "resumeiq_refresh_token",
} as const;
