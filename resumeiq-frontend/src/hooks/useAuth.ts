import { useAuthStore } from "@/stores/authStore";

/** Thin façade over the auth store — feature code should import this,
 * not the store directly, so the underlying state impl can evolve freely. */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const logout = useAuthStore((s) => s.logout);
  const refreshUser = useAuthStore((s) => s.refreshUser);

  return { user, token, isAuthenticated, isLoading, error, login, register, logout, refreshUser };
}
