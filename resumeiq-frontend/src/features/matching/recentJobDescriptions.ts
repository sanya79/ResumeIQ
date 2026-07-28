/**
 * "Recent Job Descriptions" — there's no backend endpoint for this (job
 * descriptions are only ever a request payload, never persisted as their
 * own resource per the assumed matching contract). Rather than inventing
 * a fake list, this keeps a small real history of job descriptions the
 * user has actually pasted into this browser, in localStorage — genuine
 * data, just client-scoped instead of server-scoped. Swap for a real
 * `GET /matching/job-descriptions` call if the backend ever adds one.
 */

const STORAGE_KEY = "resumeiq_recent_job_descriptions";
const MAX_ENTRIES = 8;

export interface RecentJobDescription {
  id: string;
  title: string;
  company: string;
  snippet: string;
  fullText: string;
  savedAt: string;
}

function read(): RecentJobDescription[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(entries: RecentJobDescription[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — fail silently,
    // recent-JD list is a convenience, not critical functionality.
  }
}

export function getRecentJobDescriptions(): RecentJobDescription[] {
  return read();
}

/** Guesses a display title from the first non-empty line of the JD text —
 * a real derivation from what the user pasted, not an invented label. */
function guessTitle(text: string): string {
  const firstLine = text.split("\n").map((l) => l.trim()).find(Boolean);
  if (!firstLine) return "Untitled role";
  return firstLine.length > 60 ? `${firstLine.slice(0, 57)}...` : firstLine;
}

export function saveRecentJobDescription(fullText: string, title?: string, company?: string): void {
  const trimmed = fullText.trim();
  if (trimmed.length < 20) return;

  const entries = read().filter((e) => e.fullText !== trimmed);
  const entry: RecentJobDescription = {
    id: `${Date.now()}`,
    title: title?.trim() || guessTitle(trimmed),
    company: company?.trim() || "",
    snippet: trimmed.slice(0, 140),
    fullText: trimmed,
    savedAt: new Date().toISOString(),
  };
  write([entry, ...entries]);
}

export function removeRecentJobDescription(id: string): void {
  write(read().filter((e) => e.id !== id));
}

export function clearRecentJobDescriptions(): void {
  write([]);
}
