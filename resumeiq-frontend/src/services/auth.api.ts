import { apiClient } from "./apiClient";
import type {
  AuthCredentials,
  AuthSession,
  ForgotPasswordPayload,
  RegisterPayload,
  ResetPasswordPayload,
  User,
} from "@/types";

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface BackendUser {
  id?: string;
  _id?: string;
  name?: string;
  fullName?: string;
  email?: string;
  role?: string;
  avatarUrl?: string;
  avatar?: string;
  isEmailVerified?: boolean;
  emailVerified?: boolean;
  createdAt?: string;
  created_at?: string;
}

interface BackendAuthSession {
  user: BackendUser;
  accessToken: string;
  refreshToken: string;
  verificationUrl?: string;
}

function normalizeRole(role?: string): User["role"] {
  switch (role?.trim().toUpperCase()) {
    case "ADMIN":
      return "admin";
    case "RECRUITER":
      return "recruiter";
    case "CANDIDATE":
    default:
      return "candidate";
  }
}

function normalizeUser(user: BackendUser | null | undefined): User {
  return {
    id: user?.id ?? user?._id ?? "",
    name: user?.name ?? user?.fullName ?? "User",
    email: user?.email ?? "",
    role: normalizeRole(user?.role),
    avatarUrl: user?.avatarUrl ?? user?.avatar,
    isEmailVerified: user?.isEmailVerified ?? user?.emailVerified,
    createdAt: user?.createdAt ?? user?.created_at ?? new Date().toISOString(),
  };
}

function unwrapAuthSession(payload: ApiEnvelope<BackendAuthSession>): AuthSession {
  return {
    user: normalizeUser(payload.data.user),
    accessToken: payload.data.accessToken,
    refreshToken: payload.data.refreshToken,
    verificationUrl: payload.data.verificationUrl,
  };
}

/**
 * ⚠️ ENDPOINT ASSUMPTION
 * No backend API spec has been shared with this project yet. The paths and
 * payload/response shapes below follow common REST auth conventions and are
 * a starting point only — confirm against the real API (OpenAPI/Swagger doc
 * or endpoint list) and adjust this file accordingly. Nothing else in the
 * app should call these endpoints directly; always go through this module.
 */

export async function register(payload: RegisterPayload): Promise<AuthSession> {
  const { data } = await apiClient.post<ApiEnvelope<BackendAuthSession>>("/auth/register", {
    ...payload,
    fullName: payload.name,
    role: payload.role ? payload.role.charAt(0).toUpperCase() + payload.role.slice(1).toLowerCase() : undefined,
  });
  if (data.data?.verificationUrl) {
    sessionStorage.setItem("dev_verification_url", data.data.verificationUrl);
  }
  return unwrapAuthSession(data);
}

export async function login(payload: AuthCredentials): Promise<AuthSession> {
  const { data } = await apiClient.post<ApiEnvelope<BackendAuthSession>>("/auth/login", payload);
  return unwrapAuthSession(data);
}

export async function socialLogin(
  provider: "google" | "github",
  code?: string,
  redirectUri?: string
): Promise<AuthSession> {
  const payload: any = { provider };
  if (code) {
    payload.code = code;
    payload.redirectUri = redirectUri;
  } else {
    // Mock user for local testing without OAuth configuration
    payload.fullName = provider === "google" ? "Google User" : "GitHub User";
    payload.email = `${provider}-user-${Date.now()}@resumeiq.local`;
    payload.role = "candidate";
  }

  const { data } = await apiClient.post<ApiEnvelope<BackendAuthSession>>("/auth/social-login", payload);
  return unwrapAuthSession(data);
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>("/auth/forgot-password", payload);
  return data;
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>("/auth/reset-password", payload);
  return data;
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await apiClient.get<ApiEnvelope<{ user: BackendUser }>>("/auth/me");
  return normalizeUser(data.data?.user);
}

/** Used only by the apiClient response interceptor to silently renew an
 * expired access token. Assumed shape — confirm against the real API. */
export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
  const { data } = await apiClient.post<{ accessToken: string }>("/auth/refresh", { refreshToken });
  return data;
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>('/auth/verify-email', { token });
  return data;
}

export async function resendVerificationEmail(email?: string): Promise<{ message: string; verificationUrl?: string }> {
  const { data } = await apiClient.post<ApiEnvelope<{ verificationUrl?: string }>>("/auth/resend-verification", { email });
  if (data.data?.verificationUrl) {
    sessionStorage.setItem("dev_verification_url", data.data.verificationUrl);
  }
  return {
    message: data.message || "Verification email has been resent.",
    verificationUrl: data.data?.verificationUrl
  };
}

export async function devVerifyAccount(email: string): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>("/auth/dev-verify-account", { email });
  return data;
}

export async function getAuthConfig(): Promise<{ googleClientId: string; githubClientId: string }> {
  const { data } = await apiClient.get<ApiEnvelope<{ googleClientId: string; githubClientId: string }>>("/auth/config");
  return data.data;
}
