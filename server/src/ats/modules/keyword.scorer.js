import { keywordsDb } from "../config/keywords.db.js";

/**
 * Keyword Relevance Scorer Module
 * Matches skills in the parsed resume against role-specific keywords (exact + synonyms).
 */
export default class KeywordScorer {
  async score(parsedData, ruleConfig, context = {}) {
    const maxScore = ruleConfig.weight || 20;
    const suggestions = [];
    const evidence = [];
    
    // Auto-detect target role if not explicitly provided in the evaluation context
    let targetRole = (context.targetRole || "").toLowerCase();
    if (!targetRole || !keywordsDb.roles[targetRole]) {
      targetRole = this._detectBestFitRole(parsedData);
      evidence.push(`Auto-detected closest fit job role: '${targetRole}' for evaluation.`);
    } else {
      evidence.push(`Evaluating against requested job role: '${targetRole}'.`);
    }

    const roleKeywords = keywordsDb.roles[targetRole] || [];
    if (roleKeywords.length === 0) {
      return {
        id: ruleConfig.id,
        name: ruleConfig.name,
        score: maxScore,
        maxScore,
        reason: "No target role keywords configured. Full points awarded by default.",
        evidence,
        suggestions: ["Configure role keywords in keywords.db.js to enable target role comparisons."],
        confidence: 0.5
      };
    }

    // Extract all candidate skills to lower case for comparison
    let candidateSkills = [];
    if (parsedData.skills) {
      if (Array.isArray(parsedData.skills)) {
        candidateSkills = parsedData.skills.map(s => s.toLowerCase());
      } else if (Array.isArray(parsedData.skills.technical)) {
        candidateSkills = parsedData.skills.technical.map(s => s.toLowerCase());
      }
    }
    
    // Also scan raw text (if present) for missing items that might not have parsed into skills
    const rawTextLower = (parsedData.rawText || "").toLowerCase();

    let totalWeight = 0;
    let matchedWeight = 0;
    const missingKeywords = [];

    roleKeywords.forEach(kw => {
      totalWeight += kw.weight;
      const canonical = kw.term.toLowerCase();
      const synonyms = (kw.synonyms || []).map(s => s.toLowerCase());
      
      // Check if candidate matches canonical or any synonym
      const isMatched = candidateSkills.some(skill => 
        skill === canonical || synonyms.includes(skill)
      ) || rawTextLower.includes(canonical) || synonyms.some(s => rawTextLower.includes(s));

      if (isMatched) {
        matchedWeight += kw.weight;
        evidence.push(`Matched keyword: '${kw.term}'`);
      } else {
        missingKeywords.push(kw);
      }
    });

    const matchRatio = totalWeight > 0 ? matchedWeight / totalWeight : 0;
    let score = Math.round((matchRatio * maxScore) * 100) / 100;

    // Generate smart suggestions based on missing terms
    missingKeywords.slice(0, 5).forEach(kw => {
      const aliasString = kw.synonyms ? ` (or ${kw.synonyms.join(", ")})` : "";
      suggestions.push(`Consider adding skills matching '${kw.term}'${aliasString} to strengthen alignment with ${targetRole} positions.`);
    });

    return {
      id: ruleConfig.id,
      name: ruleConfig.name,
      score,
      maxScore,
      reason: `Matched ${Math.round(matchRatio * 100)}% of the core keywords required for a ${targetRole} profile.`,
      evidence,
      suggestions,
      confidence: 0.9
    };
  }

  /**
   * Evaluates resume content to determine which predefined role matches best by skill overlap
   */
  _detectBestFitRole(parsedData) {
    let candidateSkills = [];
    if (parsedData.skills) {
      if (Array.isArray(parsedData.skills)) {
        candidateSkills = parsedData.skills.map(s => s.toLowerCase());
      } else if (Array.isArray(parsedData.skills.technical)) {
        candidateSkills = parsedData.skills.technical.map(s => s.toLowerCase());
      }
    }
    const rawTextLower = (parsedData.rawText || "").toLowerCase();

    let bestRole = "fullstack"; // Default fallback
    let maxMatches = -1;

    Object.keys(keywordsDb.roles).forEach(role => {
      let matches = 0;
      keywordsDb.roles[role].forEach(kw => {
        const canonical = kw.term.toLowerCase();
        const synonyms = (kw.synonyms || []).map(s => s.toLowerCase());
        
        const isMatched = candidateSkills.some(skill => 
          skill === canonical || synonyms.includes(skill)
        ) || rawTextLower.includes(canonical) || synonyms.some(s => rawTextLower.includes(s));

        if (isMatched) matches += kw.weight; // Prioritize higher-weight keywords
      });

      if (matches > maxMatches) {
        maxMatches = matches;
        bestRole = role;
      }
    });

    return bestRole;
  }
}
