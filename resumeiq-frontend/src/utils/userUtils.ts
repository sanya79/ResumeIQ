import type { User } from "@/types";

/**
 * Resolves a clean, human-readable display name for the candidate.
 * If user.name is "Google", "Google User", "GitHub User", etc.,
 * it automatically derives the actual user's name from their email
 * (e.g. "rahul.katiyar@gmail.com" -> "Rahul Katiyar") or parsed resume profile.
 */
export function getUserDisplayName(user: User | null | undefined, resumeProfileName?: string): string {
  if (!user) return "Candidate User";

  const rawName = (user.name || user.fullName)?.trim() || "";
  const lower = rawName.toLowerCase();
  const isGeneric = !rawName || lower === "google" || lower === "google user" || lower === "github" || lower === "github user" || lower === "user" || lower === "guest user";

  if (!isGeneric) {
    return rawName;
  }

  // 1. Check parsed resume full name
  if (resumeProfileName && resumeProfileName.trim() && resumeProfileName.trim().length > 2) {
    return resumeProfileName.trim();
  }

  // 2. Derive from candidate email prefix
  if (user.email && user.email.includes("@")) {
    const emailPrefix = user.email.split("@")[0];
    // Remove numbers and typical course/dept codes like cs, aiml, it, etc.
    const parts = emailPrefix
      .split(/[._-]+/)
      .filter((part) => !/^(cs|aiml|it|ece|ee|me|ce|\d+)$/i.test(part) && part.length > 0);

    if (parts.length > 0) {
      const formatted = parts
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
      if (formatted.trim().length > 1) {
        return formatted;
      }
    }

    const fallbackCleaned = emailPrefix.replace(/[._\-\d]+/g, " ").trim();
    if (fallbackCleaned.length > 1) {
      return fallbackCleaned
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
    }
  }

  return "Candidate User";
}

/**
 * Returns candidate's first name for greetings like "Welcome back, Sanya"
 */
export function getUserFirstName(user: User | null | undefined, resumeProfileName?: string): string {
  const fullName = getUserDisplayName(user, resumeProfileName);
  return fullName.split(" ")[0] || "there";
}
