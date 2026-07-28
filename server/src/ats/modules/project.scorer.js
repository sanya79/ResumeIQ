/**
 * Project Quality Scorer Module
 * Inspects projects sections, links to GitHub repositories, live demo addresses, and tech stacks.
 */
export default class ProjectScorer {
  async score(parsedData, ruleConfig) {
    const maxScore = ruleConfig.weight || 15;
    let score = 0;
    const evidence = [];
    const suggestions = [];

    const projects = parsedData.projects || [];

    if (projects.length === 0) {
      return {
        id: ruleConfig.id,
        name: ruleConfig.name,
        score: 0,
        maxScore,
        reason: "No project entries discovered. Projects validate your skills with practical implementation details.",
        evidence: ["Projects array is empty."],
        suggestions: ["Add a dedicated Projects section containing 2-3 recent technical or personal projects."],
        confidence: 1.0
      };
    }

    // 1. Quantity check (up to 3 points)
    let quantityPoints = 0;
    if (projects.length >= 3) {
      quantityPoints = 3;
      evidence.push(`Found ${projects.length} project listings (optimal amount).`);
    } else if (projects.length > 0) {
      quantityPoints = 1.5;
      evidence.push(`Found ${projects.length} project listing(s). Consider adding more to show depth.`);
      suggestions.push("Expand the projects catalog to show broader application of your skills.");
    }
    score += quantityPoints;

    // 2. Links Availability - GitHub & Live Demo (up to 4 points)
    let linksPoints = 0;
    let hasGitHub = false;
    let hasDemo = false;

    projects.forEach(p => {
      if (p.githubLink || (p.links && p.links.some(l => l.toLowerCase().includes("github")))) {
        hasGitHub = true;
      }
      if (p.liveLink || (p.links && p.links.some(l => !l.toLowerCase().includes("github")))) {
        hasDemo = true;
      }
    });

    if (hasGitHub && hasDemo) {
      linksPoints = 4;
      evidence.push("Projects feature both source code links (GitHub) and active live demos.");
    } else if (hasGitHub) {
      linksPoints = 2.5;
      evidence.push("Projects contain source code repositories (GitHub).");
      suggestions.push("Provide active deployment or staging URLs (live demo links) for your key projects.");
    } else if (hasDemo) {
      linksPoints = 2.5;
      evidence.push("Projects contain active deployment/live links.");
      suggestions.push("Provide links to public source code (e.g., GitHub, GitLab) to showcase your coding standards.");
    } else {
      suggestions.push("Add public URLs (GitHub / hosted deployments) to verify your projects.");
    }
    score += linksPoints;

    // 3. Technical Complexity & Diversity (up to 4 points)
    // Check if projects list technologies and check tech stack size
    let techDiversityPoints = 0;
    let totalTechCount = 0;

    projects.forEach(p => {
      const techList = p.technologies || [];
      totalTechCount += techList.length;
    });

    if (projects.length > 0) {
      const avgTech = totalTechCount / projects.length;
      if (avgTech >= 3) {
        techDiversityPoints = 4;
        evidence.push("Projects showcase a diverse and detailed technical stack.");
      } else if (avgTech >= 1) {
        techDiversityPoints = 2.5;
        evidence.push("Projects list foundational technologies.");
        suggestions.push("List specific frameworks, databases, and core libraries used for each project.");
      } else {
        suggestions.push("List the technologies and frameworks used beneath each project heading.");
      }
    }
    score += techDiversityPoints;

    // 4. Description Quality (up to 4 points)
    // Check project descriptions for length and detail
    let descriptionPoints = 0;
    let detailedDescriptions = 0;

    projects.forEach(p => {
      const desc = p.description || "";
      if (desc.split(" ").length >= 20) {
        detailedDescriptions++;
      }
    });

    const detailedRatio = projects.length > 0 ? detailedDescriptions / projects.length : 0;
    if (detailedRatio >= 0.8) {
      descriptionPoints = 4;
      evidence.push("Project summaries contain detailed technical explanations.");
    } else if (detailedRatio >= 0.5) {
      descriptionPoints = 2.5;
      evidence.push("Some project summaries offer detailed explanations.");
      suggestions.push("Provide 2-3 detailed bullet points per project explaining challenges met and choices made.");
    } else {
      suggestions.push("Rewrite project descriptions to detail challenges, architecture design patterns, and outcomes.");
    }
    score += descriptionPoints;

    // Boundary check
    score = Math.min(maxScore, Math.round(score * 100) / 100);

    return {
      id: ruleConfig.id,
      name: ruleConfig.name,
      score,
      maxScore,
      reason: `Projects quality scored at ${score}/${maxScore} based on link availability and technology descriptions.`,
      evidence,
      suggestions,
      confidence: 0.9
    };
  }
}
