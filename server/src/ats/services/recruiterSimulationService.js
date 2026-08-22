import KeywordScorer from "../modules/keyword.scorer.js";

const keywordScorer = new KeywordScorer();

export class RecruiterSimulationService {
  async simulateRecruiterReview(resumeText, jobDescription = "") {
    const normalizedText = (resumeText || "").toLowerCase();
    const normalizedJobDescription = (jobDescription || "").toLowerCase();

    // Extract dynamic keywords using KeywordScorer
    const targetKeywords = keywordScorer._extractKeywordsFromJobDescription(jobDescription || resumeText);
    const matchedKeywords = targetKeywords.filter((kw) => {
      const canonical = kw.term.toLowerCase();
      const synonyms = (kw.synonyms || []).map((s) => s.toLowerCase());
      return normalizedText.includes(canonical) || synonyms.some((s) => normalizedText.includes(s));
    });

    const matchRatio = targetKeywords.length > 0 ? matchedKeywords.length / targetKeywords.length : 0.7;

    const hasExperience = normalizedText.includes("experience") || normalizedText.includes("history") || normalizedText.includes("employment");
    const hasImpact = /\d+%|\$\d+|\b(?:improved|decreased|increased|built|led|delivered|optimized)\b/i.test(resumeText);
    const hasSummary = normalizedText.includes("summary") || normalizedText.includes("profile") || normalizedText.includes("about");

    const strengthSignals = [];
    if (matchRatio >= 0.5) strengthSignals.push("Strong keyword alignment for the target role");
    if (hasExperience) strengthSignals.push("Clear role experience is visible to a recruiter");
    if (hasImpact) strengthSignals.push("Achievement-oriented language suggests measurable impact");

    const weaknessSignals = [];
    if (matchRatio < 0.5) weaknessSignals.push("Several target-role keywords are still missing");
    if (!hasSummary) weaknessSignals.push("A concise summary section would improve first-pass clarity");
    if (!hasImpact) weaknessSignals.push("Adding quantified outcomes would strengthen the case");

    const hireProbability = Math.min(96, Math.max(34, 55 + Math.round(matchRatio * 30) + (hasImpact ? 8 : 0) - (weaknessSignals.length * 3)));
    const wordCount = (resumeText || "").split(/\s+/).filter(Boolean).length;
    const estimatedReadTime = Math.max(30, Math.min(90, Math.round(wordCount / 5)));

    const firstImpression = hireProbability >= 75 ? "Strong first impression" : hireProbability >= 60 ? "Promising first impression" : "Needs a clearer value story";

    return {
      firstImpression,
      estimatedReadTime,
      hireProbability: Math.round(hireProbability),
      strengths: strengthSignals.slice(0, 3).map((message, index) => ({ id: `strength-${index + 1}`, name: message, message })),
      weaknesses: weaknessSignals.slice(0, 3).map((message, index) => ({ id: `weakness-${index + 1}`, name: message, message })),
      explanationBullets: [
        `${matchedKeywords.length} out of ${targetKeywords.length || 5} core keywords were matched.`,
        hasImpact ? "The resume uses action-oriented language with measurable metrics." : "The resume would benefit from stronger evidence of outcomes and impact.",
        hasSummary ? "The profile reads as structured and recruiter-friendly." : "Adding a concise summary would make the opening more compelling.",
      ],
    };
  }
}

export default RecruiterSimulationService;

