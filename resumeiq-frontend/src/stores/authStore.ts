import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as authApi from "@/services/auth.api";
import { AUTH_SESSION_EXPIRED_EVENT } from "@/services/apiClient";
import type { AuthCredentials, RegisterPayload, User } from "@/types";
import { STORAGE_KEYS } from "@/utils/constants";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  /** Re-fetches the current user with the stored token — call on app boot
   * to rehydrate a session, or after actions that change the user record. */
  refreshUser: () => Promise<void>;
  /** Clears local state only, without calling the logout endpoint — used
   * by the apiClient when a refresh token has expired server-side. */
  clearSession: () => void;
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return fallback;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const session = await authApi.login(credentials);
          localStorage.setItem(STORAGE_KEYS.accessToken, session.accessToken);
          localStorage.setItem(STORAGE_KEYS.refreshToken, session.refreshToken);
          set({ user: session.user, token: session.accessToken, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false, error: extractErrorMessage(error, "Couldn't log in. Check your credentials and try again.") });
          throw error;
        }
      },

      register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const session = await authApi.register(payload);
          localStorage.setItem(STORAGE_KEYS.accessToken, session.accessToken);
          localStorage.setItem(STORAGE_KEYS.refreshToken, session.refreshToken);
          set({ user: session.user, token: session.accessToken, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false, error: extractErrorMessage(error, "Couldn't create your account. Please try again.") });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authApi.logout();
        } catch {
          // Best-effort — clear the local session regardless of whether the
          // server call succeeds (e.g. token already expired).
        } finally {
          get().clearSession();
        }
      },

      refreshUser: async () => {
        if (!get().token) return;
        set({ isLoading: true });
        try {
          const user = await authApi.getCurrentUser();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      clearSession: () => {
        localStorage.removeItem(STORAGE_KEYS.accessToken);
        localStorage.removeItem(STORAGE_KEYS.refreshToken);
        set({ user: null, token: null, isAuthenticated: false, isLoading: false, error: null });
      },
    }),
    {
      name: "resumeiq-auth",
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// apiClient dispatches this when a refresh attempt fails (expired/invalid
// refresh token) — decoupled via a DOM event so services/ never imports
// stores/ directly. Registered once at module load.
window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, () => {
  useAuthStore.getState().clearSession();
});
