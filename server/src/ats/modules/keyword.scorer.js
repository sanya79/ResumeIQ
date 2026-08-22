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

    // Extract all candidate skills to lower case for comparison
    let candidateSkills = [];
    if (parsedData.skills) {
      if (Array.isArray(parsedData.skills)) {
        candidateSkills = parsedData.skills.map((s) => s.toLowerCase());
      } else if (Array.isArray(parsedData.skills.technical)) {
        candidateSkills = (parsedData.skills.technical || []).concat(parsedData.skills.soft || []).map((s) => s.toLowerCase());
      }
    }
    const rawTextLower = (parsedData.rawText || "").toLowerCase();

    // Check if custom Job Description was provided in evaluation context
    const jobDescRaw = (context.jobDescription || "").trim();
    let targetRole = (context.targetRole || "").toLowerCase();

    let targetKeywords = [];
    if (jobDescRaw) {
      evidence.push("Evaluating against provided job description.");
      targetKeywords = this._extractKeywordsFromJobDescription(jobDescRaw);
    } else {
      if (!targetRole || !keywordsDb.roles[targetRole]) {
        targetRole = this._detectBestFitRole(parsedData);
        evidence.push(`Auto-detected closest fit job role: '${targetRole}' for evaluation.`);
      } else {
        evidence.push(`Evaluating against target job role: '${targetRole}'.`);
      }
      targetKeywords = keywordsDb.roles[targetRole] || [];
    }

    if (targetKeywords.length === 0) {
      return {
        id: ruleConfig.id,
        name: ruleConfig.name,
        score: maxScore,
        maxScore,
        reason: "No target role keywords configured. Full points awarded by default.",
        evidence,
        suggestions: ["Provide a target job description to analyze specific keyword match rates."],
        confidence: 0.5,
      };
    }

    let totalWeight = 0;
    let matchedWeight = 0;
    const missingKeywords = [];

    targetKeywords.forEach((kw) => {
      const weight = kw.weight || 8;
      totalWeight += weight;
      const canonical = kw.term.toLowerCase();
      const synonyms = (kw.synonyms || []).map((s) => s.toLowerCase());

      // Check if candidate matches canonical or any synonym
      const isMatched =
        candidateSkills.some((skill) => skill === canonical || synonyms.includes(skill)) ||
        rawTextLower.includes(canonical) ||
        synonyms.some((s) => rawTextLower.includes(s));

      if (isMatched) {
        matchedWeight += weight;
        evidence.push(`Matched keyword: '${kw.term}'`);
      } else {
        missingKeywords.push(kw);
      }
    });

    const matchRatio = totalWeight > 0 ? matchedWeight / totalWeight : 0;
    // Calibrated ML non-linear curve: 50% match yields ~70% score, 80%+ match yields ~93%+ score
    const calibratedRatio = matchRatio > 0 ? Math.min(1.0, Math.pow(matchRatio, 0.55)) : 0;
    let score = Math.round(calibratedRatio * maxScore * 100) / 100;

    // Generate smart suggestions based on missing terms
    missingKeywords.slice(0, 5).forEach((kw) => {
      const aliasString = kw.synonyms && kw.synonyms.length > 0 ? ` (or ${kw.synonyms.join(", ")})` : "";
      suggestions.push(`Add keyword '${kw.term}'${aliasString} to your skills/experience section to improve job alignment.`);
    });

    const matchPercentage = Math.round(matchRatio * 100);
    const targetLabel = jobDescRaw ? "target job description" : `${targetRole} profile`;

    return {
      id: ruleConfig.id,
      name: ruleConfig.name,
      score,
      maxScore,
      reason: `Matched ${matchPercentage}% of core keywords required for the ${targetLabel}.`,
      evidence,
      suggestions,
      confidence: jobDescRaw ? 0.95 : 0.9,
    };
  }

  /**
   * Extracts tech terms, tools, and domain keywords dynamically from job description text
   */
  _extractKeywordsFromJobDescription(jobDesc) {
    const textLower = jobDesc.toLowerCase();
    const extractedMap = new Map();

    // Check against all known terms in keywordsDb across all roles
    Object.values(keywordsDb.roles).forEach((roleList) => {
      roleList.forEach((kw) => {
        const canonical = kw.term.toLowerCase();
        const synonyms = (kw.synonyms || []).map((s) => s.toLowerCase());

        if (textLower.includes(canonical) || synonyms.some((syn) => textLower.includes(syn))) {
          if (!extractedMap.has(canonical)) {
            extractedMap.set(canonical, kw);
          }
        }
      });
    });

    // Also extract distinct skill-like terms (e.g. Docker, Python, SQL, REST, Agile, AWS, etc.) via regex
    const words = jobDesc.match(/\b[A-Z][A-Za-z0-9+#.-]{1,15}\b/g) || [];
    const commonStopWords = new Set(["The", "And", "With", "For", "You", "Your", "Role", "Must", "Have", "Will", "Work", "Team", "Experience", "Candidate", "Knowledge"]);

    words.forEach((w) => {
      if (commonStopWords.has(w) || w.length < 2) return;
      const lower = w.toLowerCase();
      if (!extractedMap.has(lower)) {
        extractedMap.set(lower, { term: w, weight: 7, synonyms: [] });
      }
    });

    return Array.from(extractedMap.values());
  }

  /**
   * Evaluates resume content to determine which predefined role matches best by skill overlap
   */
  _detectBestFitRole(parsedData) {
    let candidateSkills = [];
    if (parsedData.skills) {
      if (Array.isArray(parsedData.skills)) {
        candidateSkills = parsedData.skills.map((s) => s.toLowerCase());
      } else if (Array.isArray(parsedData.skills.technical)) {
        candidateSkills = (parsedData.skills.technical || []).concat(parsedData.skills.soft || []).map((s) => s.toLowerCase());
      }
    }
    const rawTextLower = (parsedData.rawText || "").toLowerCase();

    let bestRole = "fullstack";
    let maxMatches = -1;

    Object.keys(keywordsDb.roles).forEach((role) => {
      let matches = 0;
      keywordsDb.roles[role].forEach((kw) => {
        const canonical = kw.term.toLowerCase();
        const synonyms = (kw.synonyms || []).map((s) => s.toLowerCase());

        const isMatched =
          candidateSkills.some((skill) => skill === canonical || synonyms.includes(skill)) ||
          rawTextLower.includes(canonical) ||
          synonyms.some((s) => rawTextLower.includes(s));

        if (isMatched) matches += kw.weight;
      });

      if (matches > maxMatches) {
        maxMatches = matches;
        bestRole = role;
      }
    });

    return bestRole;
  }
}

