/**
 * Leadership Scorer Module
 * Checks for indicators of mentorship, leadership, management, or organizational roles.
 */
export default class LeadershipScorer {
  async score(parsedData, ruleConfig) {
    const maxScore = ruleConfig.weight || 3;
    let score = 0;
    const evidence = [];
    const suggestions = [];

    // Combine summary, highlights, and project details to search for leadership indicators
    const allTextBlocks = [];
    if (parsedData.candidateProfile?.summary) {
      allTextBlocks.push(parsedData.candidateProfile.summary);
    }
    (parsedData.experience || []).forEach(exp => {
      if (exp.position) allTextBlocks.push(exp.position);
      (exp.highlights || []).forEach(hl => allTextBlocks.push(hl));
    });
    (parsedData.projects || []).forEach(p => {
      if (p.role) allTextBlocks.push(p.role);
      if (p.description) allTextBlocks.push(p.description);
    });

    const consolidatedText = allTextBlocks.join(" ").toLowerCase();

    // Define leadership action words and their associated values
    const leadershipWords = [
      { word: "led", label: "Led teams or projects" },
      { word: "mentored", label: "Mentored other developers/team members" },
      { word: "managed", label: "Managed project tasks, timelines, or resources" },
      { word: "organized", label: "Organized developer meetups, workshops, or processes" },
      { word: "coached", label: "Coached or trained peers" },
      { word: "spearheaded", label: "Spearheaded new product initiatives" },
      { word: "supervised", label: "Supervised workflows or teams" }
    ];

    let matches = 0;
    leadershipWords.forEach(item => {
      if (consolidatedText.includes(item.word)) {
        matches++;
        evidence.push(`Found leadership keyword: '${item.word}' (${item.label})`);
      }
    });

    if (matches >= 2) {
      score = maxScore;
      evidence.unshift("Strong leadership profile detected.");
    } else if (matches === 1) {
      score = maxScore * 0.6;
      suggestions.push("Describe ownership of projects or mentoring of junior members to highlight leadership skills.");
    } else {
      score = 0;
      suggestions.push("Highlight leadership experience. Use words like 'led', 'mentored', or 'spearheaded' to show ownership.");
    }

    score = Math.min(maxScore, Math.round(score * 100) / 100);

    return {
      id: ruleConfig.id,
      name: ruleConfig.name,
      score,
      maxScore,
      reason: `Found ${matches} leadership indicators on the resume.`,
      evidence,
      suggestions,
      confidence: 0.85
    };
  }
}
