/**
 * Section Completeness Scorer Module
 * Inspects parsed fields and profiles to verify critical resume content sections exist.
 */
export default class SectionScorer {
  async score(parsedData, ruleConfig) {
    const maxScore = ruleConfig.weight || 20;
    let score = 0;
    const evidence = [];
    const suggestions = [];

    // Define items to check, their weights within this rule, and descriptive labels
    const checkItems = [
      { key: "contact_email", label: "Contact Email", path: () => parsedData.candidateProfile?.email },
      { key: "contact_phone", label: "Contact Phone Number", path: () => parsedData.candidateProfile?.phoneNumber },
      { key: "linkedin", label: "LinkedIn Profile Link", path: () => parsedData.candidateProfile?.linkedin },
      { key: "github", label: "GitHub Profile Link", path: () => parsedData.candidateProfile?.github },
      { key: "summary", label: "Professional Summary", path: () => parsedData.candidateProfile?.summary || parsedData.summary },
      { key: "experience", label: "Professional Work Experience", path: () => parsedData.experience?.length > 0 },
      { key: "projects", label: "Projects Section", path: () => parsedData.projects?.length > 0 },
      { key: "education", label: "Education History", path: () => parsedData.education?.length > 0 },
      { key: "skills", label: "Skills Catalog", path: () => parsedData.skills?.technical?.length > 0 || parsedData.skills?.length > 0 },
      { key: "certifications", label: "Certifications", path: () => parsedData.certifications?.length > 0 }
    ];

    const pointsPerItem = maxScore / checkItems.length;

    checkItems.forEach(item => {
      let isPresent = false;
      try {
        const val = item.path();
        isPresent = !!val;
      } catch (e) {
        isPresent = false;
      }

      if (isPresent) {
        score += pointsPerItem;
        evidence.push(`Found section/field: ${item.label}`);
      } else {
        suggestions.push(`Missing essential field or section: ${item.label}`);
      }
    });

    // Clean score precision
    score = Math.round(score * 100) / 100;

    let reason = `Found ${evidence.length} out of ${checkItems.length} required resume sections and links.`;
    if (score === maxScore) {
      reason = "Excellent! All essential sections and links are present.";
    }

    return {
      id: ruleConfig.id,
      name: ruleConfig.name,
      score,
      maxScore,
      reason,
      evidence,
      suggestions,
      confidence: 1.0 // Section detection is deterministic
    };
  }
}
