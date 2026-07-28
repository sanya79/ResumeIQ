import { apiClient } from "./apiClient";
import type {
  AuthCredentials,
  AuthSession,
  ForgotPasswordPayload,
  RegisterPayload,
  ResetPasswordPayload,
  User,
} from "@/types";

/**
 * ⚠️ ENDPOINT ASSUMPTION
 * No backend API spec has been shared with this project yet. The paths and
 * payload/response shapes below follow common REST auth conventions and are
 * a starting point only — confirm against the real API (OpenAPI/Swagger doc
 * or endpoint list) and adjust this file accordingly. Nothing else in the
 * app should call these endpoints directly; always go through this module.
 */

export async function register(payload: RegisterPayload): Promise<AuthSession> {
  const { data } = await apiClient.post<AuthSession>("/auth/register", payload);
  return data;
}

export async function login(payload: AuthCredentials): Promise<AuthSession> {
  const { data } = await apiClient.post<AuthSession>("/auth/login", payload);
  return data;
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
  const { data } = await apiClient.get<User>("/auth/me");
  return data;
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
