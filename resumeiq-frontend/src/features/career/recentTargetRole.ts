/**
 * "Last target role" — there's no backend endpoint for this (the target
 * role is only ever a request payload, never persisted as its own
 * resource per the assumed career contract). Rather than inventing a fake
 * endpoint, this keeps the user's last selection in localStorage — genuine
 * data, just client-scoped instead of server-scoped, exactly the same
 * reasoning `recentJobDescriptions.ts` documents for the matching feature.
 */

const STORAGE_KEY = "resumeiq_last_target_role";

export function getLastTargetRole(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveLastTargetRole(role: string): void {
  try {
    if (role.trim()) localStorage.setItem(STORAGE_KEY, role);
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — fail silently,
    // this is a convenience default, not critical functionality.
  }
}
