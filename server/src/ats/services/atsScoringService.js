import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class AtsScoringService {
  async scoreResumeText(resumeText, jobDescription) {
    const normalizedText = (resumeText || "").toLowerCase();
    const normalizedJobDescription = (jobDescription || "").toLowerCase();

    const formattingScore = this._scoreFormatting(normalizedText);
    const keywordScore = this._scoreKeywords(normalizedText, normalizedJobDescription);
    const sectionsScore = this._scoreSections(normalizedText);
    const readabilityScore = this._scoreReadability(normalizedText);

    const breakdown = {
      formatting: {
        score: formattingScore.score,
        reasons: formattingScore.reasons,
      },
      keywords: {
        score: keywordScore.score,
        reasons: keywordScore.reasons,
      },
      sections: {
        score: sectionsScore.score,
        reasons: sectionsScore.reasons,
      },
      readability: {
        score: readabilityScore.score,
        reasons: readabilityScore.reasons,
      },
    };

    const overall = Math.round(
      (formattingScore.score + keywordScore.score + sectionsScore.score + readabilityScore.score) / 4
    );

    const improvementSuggestions = this._buildSuggestions(breakdown);
    const compatibilityReport = this._buildCompatibilityReport(overall, breakdown);

    return {
      overall,
      breakdown,
      compatibilityReport,
      improvementSuggestions,
    };
  }

  _scoreFormatting(text) {
    const reasons = [];
    let score = 84;

    if (text.includes("two-column") || text.includes("multi-column") || text.includes("columns")) {
      score -= 12;
      reasons.push("Multi-column layout detected");
    }

    if (text.includes("table") || text.includes("sidebar")) {
      score -= 8;
      reasons.push("Dense table or sidebar content detected");
    }

    if (text.includes("experience") && text.includes("skills")) {
      reasons.push("Section balance looks reasonable");
    }

    if (score < 70) {
      reasons.push("Formatting needs simplification for ATS parsing");
    }

    return { score: Math.max(0, Math.min(100, score)), reasons };
  }

  _scoreKeywords(text, jobDescription) {
    const reasons = [];
    let score = 76;

    const requiredTerms = ["react", "node", "docker", "aws", "kubernetes", "typescript"];
    const matchedTerms = requiredTerms.filter((term) => text.includes(term) || jobDescription.includes(term));

    if (matchedTerms.length < requiredTerms.length) {
      const missing = requiredTerms.filter((term) => !matchedTerms.includes(term));
      score -= missing.length * 5;
      reasons.push(`Missing ${missing.slice(0, 3).join(", ")}`);
    }

    if (matchedTerms.length >= 3) {
      reasons.push("Core technical keywords are present");
    }

    if (jobDescription) {
      reasons.push("Job description keywords were considered");
    }

    return { score: Math.max(0, Math.min(100, score)), reasons };
  }

  _scoreSections(text) {
    const reasons = [];
    let score = 80;

    const sectionSignals = ["experience", "education", "skills", "projects", "summary"];
    const presentSections = sectionSignals.filter((section) => text.includes(section));

    if (presentSections.length < 3) {
      score -= 10;
      reasons.push("Resume sections are incomplete or hard to detect");
    } else {
      reasons.push("Core section headers are present");
    }

    if (!text.includes("summary")) {
      reasons.push("Missing a professional summary");
    }

    return { score: Math.max(0, Math.min(100, score)), reasons };
  }

  _scoreReadability(text) {
    const reasons = [];
    let score = 82;

    const wordCount = text.split(/\s+/).filter(Boolean).length;
    if (wordCount > 900) {
      score -= 10;
      reasons.push("Readability is too dense for ATS-first formatting");
    } else if (wordCount < 120) {
      score -= 12;
      reasons.push("Resume content is too brief to convey impact");
    } else {
      reasons.push("Readability looks acceptable");
    }

    if (text.includes("bullet") || text.includes("•")) {
      reasons.push("Bulleted content improves scanability");
    }

    return { score: Math.max(0, Math.min(100, score)), reasons };
  }

  _buildSuggestions(breakdown) {
    const suggestions = [];

    if (breakdown.formatting.score < 80) {
      suggestions.push("Replace complex layouts with a simple single-column format.");
    }
    if (breakdown.keywords.score < 80) {
      suggestions.push("Add missing keywords from the target role to your skills section.");
    }
    if (breakdown.sections.score < 80) {
      suggestions.push("Add clearer section headings such as Summary, Experience, Skills, and Projects.");
    }
    if (breakdown.readability.score < 80) {
      suggestions.push("Trim dense paragraphs and use concise bullets to improve scanability.");
    }

    if (suggestions.length === 0) {
      suggestions.push("Your resume already looks strong for ATS screening.");
    }

    return suggestions;
  }

  _buildCompatibilityReport(overall, breakdown) {
    const issues = [];
    if (breakdown.formatting.score < 75) issues.push("Formatting may confuse parser-based screening");
    if (breakdown.keywords.score < 75) issues.push("Target-role keyword coverage is incomplete");
    if (breakdown.sections.score < 75) issues.push("Section structure could be clearer");
    if (breakdown.readability.score < 75) issues.push("Readability is likely hurting scanner comprehension");

    return {
      overall,
      verdict: overall >= 80 ? "Strong ATS compatibility" : overall >= 60 ? "Moderate ATS compatibility" : "Weak ATS compatibility",
      issues,
    };
  }
}

export default AtsScoringService;
