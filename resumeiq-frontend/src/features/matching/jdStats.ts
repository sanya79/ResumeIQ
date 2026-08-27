/**
 * Lightweight, purely client-side text stats for the JD textarea — these
 * run instantly on keystroke, before the real AI analysis is triggered.
 * "Estimated ATS keywords" is a documented heuristic (capitalized/technical
 * tokens, deduplicated) for instant feedback while typing — not a
 * substitute for the real `matchedKeywords`/`missingKeywords` the AI
 * analysis returns, which is what the rest of the app treats as truth.
 */

const STOPWORDS = new Set([
  "the", "and", "for", "with", "you", "your", "our", "are", "will", "have",
  "this", "that", "from", "who", "job", "role", "team", "work", "years",
  "experience", "ability", "including", "such", "into", "using", "able",
  "strong", "excellent", "good", "new", "all", "not", "can", "may", "must",
]);

export interface JobDescriptionStats {
  characterCount: number;
  wordCount: number;
  estimatedKeywordCount: number;
}

export function getJobDescriptionStats(text: string): JobDescriptionStats {
  const trimmed = text.trim();
  const words = trimmed.length ? trimmed.split(/\s+/) : [];

  const tokens = trimmed.match(/[A-Za-z][A-Za-z0-9+.#/-]{1,}/g) ?? [];
  const keywordSet = new Set(
    tokens
      .filter((t) => {
        const lower = t.toLowerCase();
        if (STOPWORDS.has(lower)) return false;
        // Heuristic: acronyms/CamelCase/tech-punctuated tokens, or any
        // token >= 4 chars that isn't a stopword, read as a likely skill/
        // keyword term (e.g. "React", "AWS", "CI/CD", "Node.js").
        return /[A-Z]/.test(t) || /[.#+/-]/.test(t) || t.length >= 4;
      })
      .map((t) => t.toLowerCase())
  );

  return {
    characterCount: trimmed.length,
    wordCount: words.length,
    estimatedKeywordCount: keywordSet.size,
  };
}
