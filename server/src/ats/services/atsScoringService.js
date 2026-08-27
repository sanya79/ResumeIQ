import { AtsEngine } from "../index.js";
import { LocalResumeParserService } from "../../services/resumeParser.service.js";

const atsEngine = new AtsEngine();
const parserService = new LocalResumeParserService();

export class AtsScoringService {
  /**
   * Evaluates resume text against ATS standards and optional job description/role.
   * @param {string|Object} resumeText Raw resume text string or parsed resume object.
   * @param {string} [jobDescription=""] Optional target job description text.
   * @param {string} [targetRole=""] Optional target role identifier.
   */
  async scoreResumeText(resumeText, jobDescription = "", targetRole = "") {
    let parsedData;
    if (typeof resumeText === "object" && resumeText !== null) {
      parsedData = resumeText;
    } else {
      parsedData = parserService.parse(resumeText || "", "uploaded_resume.pdf");
    }

    const evaluation = await atsEngine.evaluate(parsedData, {
      jobDescription,
      targetRole,
    });

    const findCategoryScore = (id, defaultScore = 80) => {
      const item = (evaluation.breakdown || []).find((b) => b.id === id);
      if (!item) return defaultScore;
      return item.maxScore > 0 ? Math.round((item.score / item.maxScore) * 100) : defaultScore;
    };

    const findCategoryReasons = (id) => {
      const item = (evaluation.breakdown || []).find((b) => b.id === id);
      if (!item) return [];
      const list = [];
      if (item.reason) list.push(item.reason);
      if (Array.isArray(item.evidence)) list.push(...item.evidence);
      if (Array.isArray(item.suggestions)) list.push(...item.suggestions);
      return list;
    };

    const formattingScore = findCategoryScore("formatting_quality", 84);
    const keywordScore = findCategoryScore("keyword_relevance", 76);
    const sectionsScore = findCategoryScore("section_completeness", 80);
    const readabilityScore = findCategoryScore("readability_quality", 82);

    const breakdown = {
      formatting: {
        score: formattingScore,
        reasons: findCategoryReasons("formatting_quality"),
      },
      keywords: {
        score: keywordScore,
        reasons: findCategoryReasons("keyword_relevance"),
      },
      sections: {
        score: sectionsScore,
        reasons: findCategoryReasons("section_completeness"),
      },
      readability: {
        score: readabilityScore,
        reasons: findCategoryReasons("readability_quality"),
      },
    };

    const overall = evaluation.overallScore;
    const improvementSuggestions = evaluation.top10Improvements?.length
      ? evaluation.top10Improvements
      : this._buildSuggestions(breakdown);

    const compatibilityReport = this._buildCompatibilityReport(overall, breakdown);

    return {
      overall,
      breakdown,
      compatibilityReport,
      improvementSuggestions,
      scorecard: evaluation,
    };
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

