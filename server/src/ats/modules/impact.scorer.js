/**
 * Impact Scorer Module
 * Rewards profiles that include quantified results (%, $, counts, speed metrics).
 */
export default class ImpactScorer {
  async score(parsedData, ruleConfig) {
    const maxScore = ruleConfig.weight || 5;
    let score = 0;
    const evidence = [];
    const suggestions = [];

    // Collect experience and project descriptions to search for metrics
    const highlights = [];
    (parsedData.experience || []).forEach(exp => {
      (exp.highlights || []).forEach(hl => highlights.push(hl));
    });
    (parsedData.projects || []).forEach(p => {
      if (p.description) highlights.push(p.description);
    });

    if (highlights.length === 0) {
      return {
        id: ruleConfig.id,
        name: ruleConfig.name,
        score: 0,
        maxScore,
        reason: "No descriptions or accomplishments found to evaluate.",
        evidence: ["Highlights list is empty."],
        suggestions: ["Describe your accomplishments under past roles and projects."],
        confidence: 0.8
      };
    }

    // Patterns for metrics: percentages, numbers, currency values
    const percentPattern = /\b\d+(?:\.\d+)?%/;
    const moneyPattern = /(?:\$|£|€)\d+(?:\.\d+)?\s*(?:million|billion|k|M)?\b/i;
    const numberPattern = /\b\d+(?:,\d+)*\s*(?:\+|plus|x|times|users|requests|queries|seconds|ms|hours|days|weeks|months|years|members|developers|clients|engineers)\b/i;
    const growthKeywords = ["increased", "decreased", "reduced", "improved", "optimized", "saved", "revenue", "scale", "latency", "conversion", "efficiency"];

    let matchesCount = 0;
    const matchedExtracts = [];

    highlights.forEach(text => {
      const hasPercent = percentPattern.test(text);
      const hasMoney = moneyPattern.test(text);
      const hasNumberUnit = numberPattern.test(text);
      
      let hasGrowthTerm = false;
      const textLower = text.toLowerCase();
      growthKeywords.forEach(kw => {
        if (textLower.includes(kw)) {
          hasGrowthTerm = true;
        }
      });

      // A bullet is considered high-impact if it contains both a number/metric and a growth verb
      if ((hasPercent || hasMoney || hasNumberUnit) && hasGrowthTerm) {
        matchesCount++;
        if (matchedExtracts.length < 3) {
          // Extract a short snippet showing the match
          matchedExtracts.push(text.length > 80 ? text.slice(0, 80) + "..." : text);
        }
      }
    });

    // Score calculations: 2 high-impact bullets get full points, 1 gets half points
    if (matchesCount >= 2) {
      score = maxScore;
      evidence.push(`Found ${matchesCount} high-impact, quantified bullets. Examples:`);
      matchedExtracts.forEach(snippet => evidence.push(`  - "${snippet}"`));
    } else if (matchesCount === 1) {
      score = maxScore * 0.6;
      evidence.push(`Found 1 high-impact bullet: "${matchedExtracts[0]}"`);
      suggestions.push("Quantify your achievements with more metrics (e.g., 'Reduced api latency by 30%', 'Managed a team of 4 engineers').");
    } else {
      score = 0;
      suggestions.push("Add metrics (e.g., percentages, scale, dollar values, speed improvements) to show the impact of your contributions.");
    }

    // Format score
    score = Math.min(maxScore, Math.round(score * 100) / 100);

    return {
      id: ruleConfig.id,
      name: ruleConfig.name,
      score,
      maxScore,
      reason: `Found ${matchesCount} quantified accomplishments. High-impact bullets make a resume stand out.`,
      evidence,
      suggestions,
      confidence: 0.9
    };
  }
}
