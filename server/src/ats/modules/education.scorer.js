/**
 * Education Quality Scorer Module
 * Inspects academic degrees, major details, and GPA patterns.
 */
export default class EducationScorer {
  async score(parsedData, ruleConfig) {
    const maxScore = ruleConfig.weight || 5;
    let score = 0;
    const evidence = [];
    const suggestions = [];

    const education = parsedData.education || [];

    if (education.length === 0) {
      return {
        id: ruleConfig.id,
        name: ruleConfig.name,
        score: 0,
        maxScore,
        reason: "No education entries found. Education profiles confirm your academic credentials.",
        evidence: ["Education array is empty."],
        suggestions: ["Add an Education section detailing your degrees, universities, and graduation timelines."],
        confidence: 1.0
      };
    }

    // 1. Degree Level Verification (up to 3 points)
    let degreePoints = 0;
    let highestDegree = "None";
    
    education.forEach(edu => {
      const degreeLower = (edu.degree || "").toLowerCase();
      
      if (degreeLower.includes("phd") || degreeLower.includes("doctorate") || degreeLower.includes("doctor of")) {
        degreePoints = Math.max(degreePoints, 3);
        highestDegree = "Doctorate";
      } else if (degreeLower.includes("master") || degreeLower.includes("m.s") || degreeLower.includes("m.tech") || degreeLower.includes("mba") || degreeLower.includes("msc")) {
        degreePoints = Math.max(degreePoints, 2.8);
        highestDegree = "Master's";
      } else if (degreeLower.includes("bachelor") || degreeLower.includes("b.s") || degreeLower.includes("b.tech") || degreeLower.includes("bsc") || degreeLower.includes("b.a")) {
        degreePoints = Math.max(degreePoints, 2.5);
        highestDegree = "Bachelor's";
      } else if (degreeLower.includes("associate") || degreeLower.includes("diploma")) {
        degreePoints = Math.max(degreePoints, 1.5);
        highestDegree = "Associate / Diploma";
      }
    });

    if (degreePoints > 0) {
      score += degreePoints;
      evidence.push(`Detected academic credentials: Highest degree matches '${highestDegree}'.`);
    } else {
      score += 1.0;
      evidence.push("Detected education entries. Degree level is unclear.");
      suggestions.push("State your degree type clearly (e.g., 'Bachelor of Science in Computer Science').");
    }

    // 2. Dates & Year presence (up to 1 point)
    let hasDates = false;
    education.forEach(edu => {
      if (edu.graduationYear || edu.endDate || edu.start || edu.end) {
        hasDates = true;
      }
    });

    if (hasDates) {
      score += 1.0;
      evidence.push("Graduation details include completion dates.");
    } else {
      suggestions.push("Add graduation years or start/end dates for each academic entry.");
    }

    // 3. Major / Field of Study check (up to 1 point)
    let hasFieldOfStudy = false;
    education.forEach(edu => {
      if (edu.fieldOfStudy || edu.branch || edu.major) {
        hasFieldOfStudy = true;
      }
    });

    if (hasFieldOfStudy) {
      score += 1.0;
      evidence.push("Education records specify major or field of study.");
    } else {
      suggestions.push("Specify your major or field of study clearly under each educational entry.");
    }

    // Boundary check
    score = Math.min(maxScore, Math.round(score * 100) / 100);

    return {
      id: ruleConfig.id,
      name: ruleConfig.name,
      score,
      maxScore,
      reason: `Education quality scored at ${score}/${maxScore} based on degree level and timelines.`,
      evidence,
      suggestions,
      confidence: 0.95
    };
  }
}
