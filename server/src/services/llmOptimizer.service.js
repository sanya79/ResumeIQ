import companyProfiles from "./companyTailoringProfiles.json" with { type: "json" };

export class LLMOptimizerService {
  async optimizeResume({ resumeText, targetRole, targetCompany }) {
    throw new Error("LLMOptimizerService.optimizeResume must be implemented.");
  }
}

export class MockLLMOptimizerService extends LLMOptimizerService {
  async optimizeResume({ resumeText, targetRole, targetCompany }) {
    const normalizedText = resumeText || "";
    const role = targetRole || "Software Engineer";
    const company = targetCompany || "the target company";
    const presetProfile = companyProfiles[targetCompany] || companyProfiles.Other;

    const keywordPhrases = presetProfile?.keywords?.join(", ") || "impact and delivery";
    const tone = presetProfile?.tone || "clear and tailored";

    const rewrittenBullets = [
      `Led cross-functional delivery of ${role.toLowerCase()} initiatives with measurable impact and clear ownership.`,
      `Improved reliability and delivery speed by instrumenting workflows, reducing friction, and strengthening team collaboration.`,
      `Delivered high-quality solutions using modern tooling, with a focus on ${keywordPhrases}, maintainability, scalability, and measurable outcomes.`,
    ];

    const rewrittenSummary = `Results-driven ${role} with experience shipping resilient products, improving delivery efficiency, and collaborating across teams to deliver business impact for ${company}. The narrative is framed in a ${tone} voice and intentionally emphasizes ${keywordPhrases}.`;

    const quantifiedImpactSuggestions = [
      "Add a metric such as 'reduced deployment time by 35%' to strengthen credibility.",
      "Quantify user impact with results like 'improved reliability for 10k+ users'.",
      "Mention revenue, efficiency, or SLA improvements where possible.",
    ];

    const tailoringNotes = targetCompany
      ? [
          `Tailored the narrative to align with ${company}'s product and engineering priorities.`,
          `Emphasized ${keywordPhrases} to reflect a ${tone} positioning.`,
        ]
      : ["Add company-specific alignment points to make the summary feel more tailored."];

    return {
      rewrittenBullets,
      rewrittenSummary,
      quantifiedImpactSuggestions,
      tailoringNotes,
    };
  }
}

export default MockLLMOptimizerService;
