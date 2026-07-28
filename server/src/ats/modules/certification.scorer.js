/**
 * Certification Scorer Module
 * Inspects technical certifications, issuing organizations, and expiry dates.
 */
export default class CertificationScorer {
  async score(parsedData, ruleConfig) {
    const maxScore = ruleConfig.weight || 2;
    let score = 0;
    const evidence = [];
    const suggestions = [];

    const certifications = parsedData.certifications || [];

    if (certifications.length === 0) {
      // Return 0, but since certifications are a minor section, this is not heavily penalized
      return {
        id: ruleConfig.id,
        name: ruleConfig.name,
        score: 0,
        maxScore,
        reason: "No certifications found. Certifications validate continuous learning.",
        evidence: ["Certifications array is empty."],
        suggestions: ["Add relevant professional certifications (e.g., AWS, Scrum, Google Cloud) if applicable."],
        confidence: 0.95
      };
    }

    // 1. Quantity Check (up to 1.2 points)
    if (certifications.length >= 2) {
      score += 1.2;
      evidence.push(`Found ${certifications.length} certifications (optimal quantity).`);
    } else {
      score += 0.8;
      evidence.push("Found 1 certification. Consider listing other relevant credentials.");
    }

    // 2. Detail Completeness - Provider & Credential ID (up to 0.8 points)
    let hasProviders = false;
    let hasCredIds = false;

    certifications.forEach(cert => {
      if (cert.provider || cert.issuingOrganization) {
        hasProviders = true;
      }
      if (cert.credentialId || cert.id) {
        hasCredIds = true;
      }
    });

    if (hasProviders && hasCredIds) {
      score += 0.8;
      evidence.push("Certifications include issuers and credential IDs.");
    } else if (hasProviders) {
      score += 0.5;
      evidence.push("Certifications include issuer details.");
      suggestions.push("Add credential IDs to your certification entries to verify their authenticity.");
    } else {
      suggestions.push("Specify the issuing organizations (e.g. AWS, Coursera, Udemy) for your certifications.");
    }

    // Score boundary
    score = Math.min(maxScore, Math.round(score * 100) / 100);

    return {
      id: ruleConfig.id,
      name: ruleConfig.name,
      score,
      maxScore,
      reason: `Certifications scored at ${score}/${maxScore} based on completeness of details.`,
      evidence,
      suggestions,
      confidence: 0.9
    };
  }
}
