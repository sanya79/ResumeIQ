export type UserRole = "recruiter" | "candidate" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  isEmailVerified?: boolean;
  createdAt: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
  /** Client-side only by default; forwarded to the API so it can issue a
   * longer-lived refresh token, if the backend supports that. */
  rememberMe?: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
}
