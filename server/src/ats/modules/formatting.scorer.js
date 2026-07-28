/**
 * Formatting Quality Scorer Module
 * Inspects document formatting, section sizes, and page layouts.
 */
export default class FormattingScorer {
  async score(parsedData, ruleConfig) {
    const maxScore = ruleConfig.weight || 10;
    let score = maxScore; // Start with maximum and deduct for anomalies
    const evidence = [];
    const suggestions = [];

    // 1. Evaluate Experience Descriptions Sizing (up to 3 points deduction)
    const experience = parsedData.experience || [];
    let excessivelyLongJob = false;
    let excessivelyShortJob = false;

    experience.forEach(exp => {
      const bulletText = (exp.highlights || []).join(" ");
      const wordsCount = bulletText.split(" ").length;

      if (wordsCount > 350) {
        excessivelyLongJob = true;
      }
      if (wordsCount > 0 && wordsCount < 15) {
        excessivelyShortJob = true;
      }
    });

    if (excessivelyLongJob) {
      score -= 1.5;
      suggestions.push("Some experience descriptions are too dense. Shorten job descriptions and focus on high-impact bullet points.");
    }
    if (excessivelyShortJob) {
      score -= 1.5;
      suggestions.push("Some experience listings are too brief. Add more context to highlight your duties and achievements.");
    }

    if (!excessivelyLongJob && !excessivelyShortJob && experience.length > 0) {
      evidence.push("Experience section descriptions feature balanced content density.");
    }

    // 2. Evaluate Projects Layout Sizing (up to 3 points deduction)
    const projects = parsedData.projects || [];
    let excessivelyLongProject = false;
    let excessivelyShortProject = false;

    projects.forEach(p => {
      const desc = p.description || "";
      const wordsCount = desc.split(" ").length;

      if (wordsCount > 150) {
        excessivelyLongProject = true;
      }
      if (wordsCount > 0 && wordsCount < 8) {
        excessivelyShortProject = true;
      }
    });

    if (excessivelyLongProject) {
      score -= 1.5;
      suggestions.push("Project summaries are too wordy. Focus descriptions on your core contribution and tech stack details.");
    }
    if (excessivelyShortProject) {
      score -= 1.5;
      suggestions.push("Some project descriptions are too brief. Add details about your contributions and technical implementation details.");
    }

    if (!excessivelyLongProject && !excessivelyShortProject && projects.length > 0) {
      evidence.push("Project descriptions feature consistent and balanced length formatting.");
    }

    // 3. Section Completeness Balances (up to 4 points deduction)
    // Check if key components are disproportionate (e.g. huge text blocks with very few skill listings)
    const rawText = parsedData.rawText || "";
    const totalWords = rawText.split(" ").length;
    
    if (totalWords > 1200) {
      score -= 2;
      suggestions.push(`Resume word count is high (${totalWords} words). Target a word count between 400 and 800 words to ensure readability.`);
    } else if (totalWords > 0 && totalWords < 200) {
      score -= 2;
      suggestions.push(`Resume word count is very low (${totalWords} words). Expand on your experience, skills, and projects to add detail.`);
    } else if (totalWords > 0) {
      evidence.push(`Optimal resume word count detected (${totalWords} words).`);
    }

    // Guard negative scores
    score = Math.max(0, Math.round(score * 100) / 100);

    if (score === maxScore) {
      evidence.push("Formatting looks consistent. Sections are balanced and formatted cleanly.");
    }

    return {
      id: ruleConfig.id,
      name: ruleConfig.name,
      score,
      maxScore,
      reason: `Formatting consistency score: ${score}/${maxScore} after checking section sizing and word counts.`,
      evidence,
      suggestions,
      confidence: 0.8
    };
  }
}
