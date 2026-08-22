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

    // Define items to check with relative weight importance
    const checkItems = [
      { key: "contact_email", label: "Contact Email", weight: 1.5, isEssential: true, path: () => parsedData.candidateProfile?.email },
      { key: "contact_phone", label: "Contact Phone Number", weight: 1.0, isEssential: true, path: () => parsedData.candidateProfile?.phoneNumber },
      { key: "summary", label: "Professional Summary", weight: 1.5, isEssential: true, path: () => parsedData.candidateProfile?.summary || parsedData.summary },
      { key: "experience", label: "Work Experience", weight: 2.0, isEssential: true, path: () => parsedData.experience?.length > 0 },
      { key: "education", label: "Education History", weight: 1.5, isEssential: true, path: () => parsedData.education?.length > 0 },
      { key: "skills", label: "Skills Catalog", weight: 2.0, isEssential: true, path: () => parsedData.skills?.technical?.length > 0 || (Array.isArray(parsedData.skills) && parsedData.skills.length > 0) },
      { key: "projects", label: "Projects Section", weight: 1.0, isEssential: false, path: () => parsedData.projects?.length > 0 },
      { key: "linkedin", label: "LinkedIn Profile Link", weight: 0.5, isEssential: false, path: () => parsedData.candidateProfile?.linkedin },
      { key: "github", label: "GitHub Profile Link", weight: 0.5, isEssential: false, path: () => parsedData.candidateProfile?.github },
      { key: "certifications", label: "Certifications", weight: 0.5, isEssential: false, path: () => parsedData.certifications?.length > 0 },
    ];

    const totalRelativeWeight = checkItems.reduce((acc, item) => acc + item.weight, 0);
    let earnedWeight = 0;

    checkItems.forEach((item) => {
      let isPresent = false;
      try {
        const val = item.path();
        isPresent = !!val;
      } catch (e) {
        isPresent = false;
      }

      if (isPresent) {
        earnedWeight += item.weight;
        evidence.push(`Found section/field: ${item.label}`);
      } else if (item.isEssential) {
        suggestions.push(`Missing essential field/section: ${item.label}`);
      } else {
        suggestions.push(`Optional addition: Consider adding a ${item.label} if applicable to your target role.`);
      }
    });

    score = Math.round((earnedWeight / totalRelativeWeight) * maxScore * 100) / 100;

    let reason = `Found ${evidence.length} out of ${checkItems.length} evaluated resume sections and contact signals.`;
    if (score >= maxScore * 0.9) {
      reason = "Excellent! Core resume sections and contact information are complete.";
    }

    return {
      id: ruleConfig.id,
      name: ruleConfig.name,
      score,
      maxScore,
      reason,
      evidence,
      suggestions,
      confidence: 1.0,
    };
  }
}

