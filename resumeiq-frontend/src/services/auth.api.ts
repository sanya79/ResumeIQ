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
}

function normalizeRole(role?: string): User["role"] {
  switch (role?.toLowerCase()) {
    case "admin":
      return "admin";
    case "candidate":
      return "candidate";
    case "recruiter":
    default:
      return "recruiter";
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
  });
  return unwrapAuthSession(data);
}

export async function login(payload: AuthCredentials): Promise<AuthSession> {
  const { data } = await apiClient.post<ApiEnvelope<BackendAuthSession>>("/auth/login", payload);
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

export async function resendVerificationEmail(): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>("/auth/resend-verification");
  return data;
}
