/**
 * Experience Quality Scorer Module
 * Inspects professional experience records, length of service, promotions, and description content.
 */
export default class ExperienceScorer {
  async score(parsedData, ruleConfig) {
    const maxScore = ruleConfig.weight || 15;
    let score = 0;
    const evidence = [];
    const suggestions = [];

    const experience = parsedData.experience || [];

    if (experience.length === 0) {
      return {
        id: ruleConfig.id,
        name: ruleConfig.name,
        score: 0,
        maxScore,
        reason: "No work experience found. Recruiter ATS systems heavily penalize profiles without history.",
        evidence: ["Experience array is empty."],
        suggestions: ["Add a professional experience section detailing past roles, duties, and key projects."],
        confidence: 1.0
      };
    }

    // 1. Duration Evaluation (up to 4 points)
    // Calculate total years of experience
    let totalMonths = 0;
    experience.forEach(exp => {
      // Look for a durationInMonths calculated by Parser, or mock it if not present
      const duration = exp.durationInMonths || this._estimateDurationInMonths(exp.startDate, exp.endDate);
      totalMonths += duration;
    });

    const totalYears = totalMonths / 12;
    let durationPoints = 0;
    if (totalYears >= 5) {
      durationPoints = 4;
      evidence.push(`Robust work history detected: ${totalYears.toFixed(1)} total years of experience.`);
    } else if (totalYears >= 2) {
      durationPoints = 3;
      evidence.push(`Mid-level work history detected: ${totalYears.toFixed(1)} total years of experience.`);
    } else if (totalYears > 0) {
      durationPoints = 1.5;
      evidence.push(`Junior-level work history detected: ${totalYears.toFixed(1)} total years of experience.`);
    } else {
      suggestions.push("Experience duration appears empty or unquantified.");
    }
    score += durationPoints;

    // 2. Action Verbs & Description Quality (up to 4 points)
    const actionVerbs = ["optimized", "designed", "architected", "developed", "built", "implemented", "managed", "led", "coordinated", "delivered", "automated"];
    let matchedVerbsCount = 0;
    let totalHighlightsCount = 0;
    let actionVerbMatch = false;

    experience.forEach(exp => {
      const highlights = exp.highlights || [];
      totalHighlightsCount += highlights.length;
      highlights.forEach(hl => {
        const lowerHl = hl.toLowerCase();
        actionVerbs.forEach(verb => {
          if (lowerHl.includes(verb)) {
            matchedVerbsCount++;
          }
        });
      });
    });

    let descriptionPoints = 0;
    if (totalHighlightsCount > 0) {
      const verbDensity = matchedVerbsCount / totalHighlightsCount;
      if (verbDensity >= 0.5) {
        descriptionPoints = 4;
        evidence.push("Strong usage of industry action verbs in experience descriptions.");
      } else if (verbDensity >= 0.2) {
        descriptionPoints = 2.5;
        evidence.push("Adequate action verb usage in descriptions.");
      } else {
        descriptionPoints = 1;
        suggestions.push("Describe accomplishments using strong active verbs (e.g., 'Architected', 'Optimized', 'Delivered') instead of passive duties.");
      }
    } else {
      suggestions.push("Past roles lack detailed bullet points describing duties or achievements.");
    }
    score += descriptionPoints;

    // 3. Career Progression / Promotions (up to 4 points)
    // Check if there are indicators of growth (multiple roles at same company or senior titles)
    let progressionPoints = 0;
    const companies = experience.map(exp => (exp.company || "").toLowerCase().trim());
    const uniqueCompanies = new Set(companies.filter(c => c.length > 0));
    const titleString = experience.map(exp => (exp.position || "").toLowerCase()).join(" ");

    // Check multiple positions at same company (indicates internal promotions)
    const hasMultipleRolesAtSameCompany = companies.length > uniqueCompanies.size;
    const hasSeniorRoles = titleString.includes("senior") || titleString.includes("lead") || titleString.includes("principal") || titleString.includes("manager");

    if (hasMultipleRolesAtSameCompany) {
      progressionPoints = 4;
      evidence.push("Career growth/promotion trajectory detected (multiple roles under same organization).");
    } else if (hasSeniorRoles) {
      progressionPoints = 3;
      evidence.push("Senior or leadership role responsibilities detected.");
    } else {
      progressionPoints = 2;
      suggestions.push("Outline career progression or leadership growth clearly in job titles where possible.");
    }
    score += progressionPoints;

    // 4. Tenure Stability (up to 3 points)
    // Check average tenure per company to flag job-hopping tendencies
    let stabilityPoints = 0;
    if (uniqueCompanies.size > 0) {
      const averageTenureMonths = totalMonths / uniqueCompanies.size;
      if (averageTenureMonths >= 24) {
        stabilityPoints = 3;
        evidence.push(`Excellent career stability: Average company tenure is ${(averageTenureMonths / 12).toFixed(1)} years.`);
      } else if (averageTenureMonths >= 12) {
        stabilityPoints = 2;
        evidence.push(`Normal career stability: Average company tenure is ${(averageTenureMonths / 12).toFixed(1)} years.`);
      } else {
        stabilityPoints = 1;
        suggestions.push("Short average job tenure detected. Highlight long-term engagements or frame contract roles clearly.");
      }
    }
    score += stabilityPoints;

    // Boundary check
    score = Math.min(maxScore, Math.round(score * 100) / 100);

    return {
      id: ruleConfig.id,
      name: ruleConfig.name,
      score,
      maxScore,
      reason: `Experience score graded at ${score}/${maxScore} based on tenure, action verbs, and progression.`,
      evidence,
      suggestions,
      confidence: 0.85
    };
  }

  _estimateDurationInMonths(start, end) {
    if (!start) return 12; // Fallback default tenure (1 year)
    
    const parseDate = (str) => {
      if (!str || str.toLowerCase().includes("present")) return new Date();
      const d = new Date(str);
      return isNaN(d.getTime()) ? new Date() : d;
    };

    const startDate = parseDate(start);
    const endDate = parseDate(end);

    const diffMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
    return Math.max(1, diffMonths);
  }
}
