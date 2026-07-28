const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | undefined {
  if (!value.trim()) return "Email is required.";
  if (!EMAIL_REGEX.test(value.trim())) return "Enter a valid email address.";
  return undefined;
}

export function validateName(value: string): string | undefined {
  if (!value.trim()) return "Full name is required.";
  if (value.trim().length < 2) return "Name must be at least 2 characters.";
  return undefined;
}

export function validateLoginPassword(value: string): string | undefined {
  if (!value) return "Password is required.";
  return undefined;
}

export function validateNewPassword(value: string): string | undefined {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Use at least 8 characters.";
  if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) return "Include at least one letter and one number.";
  return undefined;
}

export function validateConfirmPassword(password: string, confirmPassword: string): string | undefined {
  if (!confirmPassword) return "Please confirm your password.";
  if (password !== confirmPassword) return "Passwords don't match.";
  return undefined;
}

export type PasswordStrength = 0 | 1 | 2 | 3 | 4;

export interface PasswordStrengthResult {
  score: PasswordStrength;
  label: "Very weak" | "Weak" | "Fair" | "Good" | "Strong";
  color: string;
}

const STRENGTH_LEVELS: Omit<PasswordStrengthResult, "score">[] = [
  { label: "Very weak", color: "#F87171" },
  { label: "Weak", color: "#F87171" },
  { label: "Fair", color: "#EC4899" },
  { label: "Good", color: "#22D3EE" },
  { label: "Strong", color: "#10B981" },
];

/** Simple heuristic strength meter — length + character-class variety.
 * Intentionally not a full entropy calculation; it's a UX nudge, not a
 * security boundary (the real validation is `validateNewPassword`). */
export function getPasswordStrength(password: string): PasswordStrengthResult {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;

  const clamped = Math.min(4, score) as PasswordStrength;
  return { score: clamped, ...STRENGTH_LEVELS[clamped] };
}
