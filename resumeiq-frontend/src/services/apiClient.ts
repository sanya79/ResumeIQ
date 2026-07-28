import axios, { type InternalAxiosRequestConfig, AxiosError } from "axios";
import { API_BASE_URL, STORAGE_KEYS } from "@/utils/constants";

/**
 * Central Axios instance. All feature services (resume, ats, matching,
 * interview, auth) should import this rather than creating their own client.
 *
 * Token strategy: supports both bearer-token and httpOnly-cookie backends.
 * `withCredentials` lets a cookie-based backend work out of the box; the
 * request interceptor also attaches a stored bearer token if one exists,
 * so nothing needs to change here once the real backend's strategy is confirmed.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
  withCredentials: true,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(STORAGE_KEYS.accessToken);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // FormData (file uploads) needs the browser to set its own
  // multipart/form-data Content-Type with the correct boundary — the
  // instance-level "application/json" default would otherwise break parsing.
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

/**
 * `window` events used to decouple this module from the Zustand auth store
 * (avoids a service ↔ store import cycle). `authStore` subscribes to
 * `auth:session-expired` and clears itself + redirects when it fires.
 */
export const AUTH_SESSION_EXPIRED_EVENT = "auth:session-expired";

let isRefreshing = false;
let pendingRequests: Array<(token: string | null) => void> = [];

function resolvePending(token: string | null) {
  pendingRequests.forEach((cb) => cb(token));
  pendingRequests = [];
}

function clearStoredSession() {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
    if (!refreshToken) {
      clearStoredSession();
      window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // Queue concurrent 401s behind a single in-flight refresh call instead
    // of firing one refresh request per failed request.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push((token) => {
          if (!token) return reject(error);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    isRefreshing = true;
    try {
      // Plain axios call (not `apiClient`) so this never re-enters these
      // same interceptors. Endpoint shape assumed — see auth.api.ts note.
      const { data } = await axios.post<{ accessToken: string }>(`${API_BASE_URL}/auth/refresh`, {
        refreshToken,
      });
      localStorage.setItem(STORAGE_KEYS.accessToken, data.accessToken);
      resolvePending(data.accessToken);
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      resolvePending(null);
      clearStoredSession();
      window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
