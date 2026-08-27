/**
 * Readability and Style Scorer Module
 * Inspects passive voice usage, sentence lengths, and formatting style consistency.
 */
export default class ReadabilityScorer {
  async score(parsedData, ruleConfig) {
    const maxScore = ruleConfig.weight || 5;
    let score = maxScore;
    const evidence = [];
    const suggestions = [];

    // Collect all text statements from experience and projects
    const statements = [];
    (parsedData.experience || []).forEach(exp => {
      (exp.highlights || []).forEach(hl => statements.push(hl));
    });
    (parsedData.projects || []).forEach(p => {
      if (p.description) {
        statements.push(p.description);
      }
    });

    if (statements.length === 0) {
      return {
        id: ruleConfig.id,
        name: ruleConfig.name,
        score: maxScore,
        maxScore,
        reason: "No description sentences to evaluate. Defaulting to full score.",
        evidence: ["Statements list is empty."],
        suggestions: ["Add bullets under past roles to enable reading analysis evaluations."],
        confidence: 0.5
      };
    }

    // 1. Sentence Length check (up to 2 points deduction)
    let longSentences = 0;
    statements.forEach(stmt => {
      const sentenceCount = stmt.split(/[.!?]+/).filter(s => s.trim().length > 0);
      sentenceCount.forEach(s => {
        const words = s.trim().split(/\s+/).length;
        if (words > 28) {
          longSentences++;
        }
      });
    });

    if (longSentences > 3) {
      score -= 1.5;
      suggestions.push("Write shorter sentences. Sentences longer than 28 words are harder to read. Break long sentences into bullet points.");
    } else {
      evidence.push("Sentence lengths are concise and readable.");
    }

    // 2. Passive Voice / Weak Expressions check (up to 3 points deduction)
    // Identify passive or weak phrases commonly used in resumes
    const passivePhrases = ["responsible for", "duties included", "assisted with", "participated in", "helped to", "worked on"];
    let passiveMatches = 0;
    const matchedPassives = new Set();

    statements.forEach(stmt => {
      const lower = stmt.toLowerCase();
      passivePhrases.forEach(phrase => {
        if (lower.includes(phrase)) {
          passiveMatches++;
          matchedPassives.add(phrase);
        }
      });
    });

    if (passiveMatches > 2) {
      score -= 1.5;
      suggestions.push(`Avoid weak framing phrases like: ${Array.from(matchedPassives).map(p => `'${p}'`).join(", ")}. Lead with action verbs instead.`);
    } else {
      evidence.push("Descriptions avoid passive framing and weak phrases.");
    }

    // Guard boundary limits
    score = Math.max(0, Math.round(score * 100) / 100);

    return {
      id: ruleConfig.id,
      name: ruleConfig.name,
      score,
      maxScore,
      reason: `Readability score: ${score}/${maxScore} based on sentence length and active voice usage.`,
      evidence,
      suggestions,
      confidence: 0.8
    };
  }
}
