export class RecruiterSimulationService {
  async simulateRecruiterReview(resumeText, jobDescription) {
    const normalizedText = (resumeText || "").toLowerCase();
    const normalizedJobDescription = (jobDescription || "").toLowerCase();

    const keywords = ["react", "node", "typescript", "docker", "aws", "kubernetes"];
    const matchedKeywords = keywords.filter((keyword) => normalizedText.includes(keyword) || normalizedJobDescription.includes(keyword));

    const hasExperience = normalizedText.includes("experience") || normalizedText.includes("engineer") || normalizedText.includes("developer");
    const hasImpact = normalizedText.includes("led") || normalizedText.includes("built") || normalizedText.includes("delivered") || normalizedText.includes("improved");
    const hasSummary = normalizedText.includes("summary") || normalizedText.includes("about") || normalizedText.includes("professional");

    const strengthSignals = [];
    if (matchedKeywords.length >= 3) strengthSignals.push("Strong keyword alignment for modern engineering roles");
    if (hasExperience) strengthSignals.push("Clear role experience is visible to a recruiter");
    if (hasImpact) strengthSignals.push("Achievement-oriented language suggests measurable impact");

    const weaknessSignals = [];
    if (matchedKeywords.length < 4) weaknessSignals.push("A few target-role keywords are still missing");
    if (!hasSummary) weaknessSignals.push("A concise summary section would improve first-pass clarity");
    if (!hasImpact) weaknessSignals.push("Adding quantified outcomes would strengthen the case");

    const hireProbability = Math.min(96, Math.max(34, 58 + matchedKeywords.length * 4 + (hasImpact ? 6 : 0) - (weaknessSignals.length * 3)));
    const estimatedReadTime = Math.max(35, 45 + Math.min(25, matchedKeywords.length * 2));

    const firstImpression = hireProbability >= 75 ? "Strong first impression" : hireProbability >= 60 ? "Promising first impression" : "Needs a clearer value story";

    return {
      firstImpression,
      estimatedReadTime,
      hireProbability: Math.round(hireProbability),
      strengths: strengthSignals.slice(0, 3).map((message, index) => ({ id: `strength-${index + 1}`, name: message, message })),
      weaknesses: weaknessSignals.slice(0, 3).map((message, index) => ({ id: `weakness-${index + 1}`, name: message, message })),
      explanationBullets: [
        `${matchedKeywords.length} relevant keywords were detected for the target role.`,
        hasImpact ? "The resume uses action-oriented language that signals ownership and delivery." : "The resume would benefit from stronger evidence of outcomes and impact.",
        hasSummary ? "The profile reads as structured and recruiter-friendly." : "Adding a concise summary would make the opening more compelling.",
      ],
    };
  }
}

export default RecruiterSimulationService;
