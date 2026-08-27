import { useMutation, useQuery } from "@tanstack/react-query";
import * as authApi from "@/services/auth.api";
import { useAuthStore } from "@/stores/authStore";
import type { AuthCredentials, ForgotPasswordPayload, RegisterPayload, ResetPasswordPayload } from "@/types";

/**
 * These wrap the store's async actions (source of truth for session state)
 * in React Query mutations, so pages get consistent isPending/isError/
 * isSuccess flags for loading buttons and success animations without
 * duplicating state in the store.
 */

export function useLoginMutation() {
  const login = useAuthStore((s) => s.login);
  return useMutation({
    mutationFn: (credentials: AuthCredentials) => login(credentials),
  });
}

export function useRegisterMutation() {
  const register = useAuthStore((s) => s.register);
  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => authApi.forgotPassword(payload),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authApi.resetPassword(payload),
  });
}

export function useResendVerificationMutation() {
  return useMutation({
    mutationFn: () => authApi.resendVerificationEmail(),
  });
}

/** Bootstraps the session on app load when a token is already stored. */
export function useCurrentUserQuery() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.getCurrentUser,
    enabled: !!token,
    retry: false,
  });
}
