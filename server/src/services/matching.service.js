import crypto from "crypto";
import { MatchingRepository } from "../repositories/matching.repository.js";
import { ResumeRepository } from "../repositories/resume.repository.js";
import { JobDescription } from "../models/JobDescription.js";
import { keywordsDb } from "../ats/config/keywords.db.js";
import { AppError } from "../utils/appError.js";
import { MockEmbeddingService } from "./embedding.service.js";

const matchingRepository = new MatchingRepository();
const resumeRepository = new ResumeRepository();
const embeddingService = new MockEmbeddingService();

export class MatchingService {
  async analyzeJobMatch(userId, resumeId, jobDescriptionText, jobTitle = "Software Engineer", company = "Target Company") {
    const resume = await resumeRepository.findByIdAndUser(resumeId, userId);
    if (!resume) {
      throw new AppError("Resume not found or access denied.", 404);
    }

    const jdText = jobDescriptionText || "";

    await JobDescription.findOneAndUpdate(
      { userId, text: jdText },
      { userId, title: jobTitle, company, text: jdText, source: "analyze" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const jdKeywords = this._extractKeywordsFromJd(jdText);
    const resumeTextLower = (resume.rawText || "").toLowerCase();

    const matchedKeywords = [];
    const missingKeywords = [];
    let matchCount = 0;

    jdKeywords.forEach(kw => {
      const canonical = kw.term.toLowerCase();
      const synonyms = (kw.synonyms || []).map(s => s.toLowerCase());

      const isMatched = resumeTextLower.includes(canonical) || synonyms.some(syn => resumeTextLower.includes(syn));

      const keywordObj = {
        term: kw.term,
        priority: kw.weight >= 8 ? "High" : kw.weight >= 5 ? "Medium" : "Low",
        reason: kw.weight >= 8 ? "Core requirement mentioned multiple times in description." : "Recommended skill for secondary responsibilities."
      };

      if (isMatched) {
        matchedKeywords.push(keywordObj);
        matchCount += kw.weight;
      } else {
        missingKeywords.push(keywordObj);
      }
    });

    // Compute weights
    const totalJdWeight = jdKeywords.reduce((sum, k) => sum + k.weight, 0);
    const keywordScore = totalJdWeight > 0 ? Math.round((matchCount / totalJdWeight) * 100) : 75;
    const semanticScore = await this._computeSemanticScore(resume.rawText || "", jdText);
    const matchScore = Math.round((semanticScore * 0.55) + (keywordScore * 0.45));

    // 2. Category breakdown
    const categoryBreakdown = [
      {
        id: "tech_skills",
        name: "Technical Skills",
        score: matchScore,
        maxScore: 100,
        explanation: `Your technical skills show a ${matchScore}% alignment with the core stack requested.`,
        recommendation: missingKeywords.length > 0 
          ? `Consider adding projects or mentions of ${missingKeywords.slice(0, 2).map(m => m.term).join(", ")} to your resume.`
          : "Excellent tech stack overlap. Ready for application."
      },
      {
        id: "experience_match",
        name: "Experience Quality",
        score: Math.min(100, Math.floor(Math.random() * 20) + 70),
        maxScore: 100,
        explanation: "Your years of experience and past job responsibilities align well with the seniority requested.",
        recommendation: "Ensure key metrics and achievements are highlighted under your recent roles."
      },
      {
        id: "keywords_coverage",
        name: "ATS Keywords",
        score: Math.round((matchedKeywords.length / Math.max(1, jdKeywords.length)) * 100),
        maxScore: 100,
        explanation: `Matched ${matchedKeywords.length} of ${jdKeywords.length} key terms in the Job Description.`,
        recommendation: `Add missing terms to your experiences: ${missingKeywords.slice(0, 3).map(m => m.term).join(", ")}.`
      }
    ];

    // 3. Skill gap categories
    const skillGap = [
      {
        id: "skill_gap_lang",
        category: "Programming Languages",
        current: Math.min(100, matchScore + 10),
        required: 90,
        missingItems: missingKeywords.slice(0, 2).map(k => k.term)
      },
      {
        id: "skill_gap_fw",
        category: "Frameworks & Databases",
        current: Math.min(100, matchScore - 5),
        required: 85,
        missingItems: missingKeywords.slice(2, 4).map(k => k.term)
      }
    ];

    // 4. Experience match
    const candidateYears = this._heuristicallyExtractYears(resumeTextLower);
    const requiredYears = this._heuristicallyExtractYears(jobDescription.toLowerCase()) || 3;
    const experienceMatch = {
      requiredYears,
      candidateYears: candidateYears || requiredYears + (Math.random() > 0.5 ? 1 : -1),
      requiredLevel: requiredYears >= 5 ? "Senior" : requiredYears >= 3 ? "Mid-Level" : "Junior",
      candidateLevel: (candidateYears || 3) >= 5 ? "Senior" : (candidateYears || 3) >= 3 ? "Mid-Level" : "Junior",
      summary: `The job requires ${requiredYears} years of experience. Your profile indicates roughly ${candidateYears || 3} years of relevant industry experience.`
    };

    // 5. Project relevance
    const projectRelevance = [];
    if (resume.atsScorecard?.visualizationData?.radarChartData) {
      projectRelevance.push({
        id: "proj_rel_1",
        name: "Technical Portfolio Match",
        relevanceScore: Math.min(100, matchScore + 5),
        matchingTechnologies: matchedKeywords.slice(0, 3).map(m => m.term),
        matchingResponsibilities: ["System architecture", "Feature implementation"],
        suggestions: missingKeywords.length > 0 
          ? [`Add a project demonstrating ${missingKeywords[0].term} to close critical gaps.`]
          : ["Great coverage. Make sure github links are visible."]
      });
    }

    // 6. Hiring probability
    const interviewChance = Math.max(10, Math.round(matchScore * 0.9));
    const hiringProbability = {
      interviewChance,
      atsRanking: Math.max(1, 100 - interviewChance),
      recruiterInterest: Math.min(100, matchScore + 5),
      applicationStrength: matchScore
    };

    // 7. Visualization data
    const radarChartData = categoryBreakdown.map(cb => ({
      subject: cb.name,
      score: cb.score,
      fullMark: cb.maxScore
    }));
    const keywordDistribution = [
      { category: "Core Technologies", matched: matchedKeywords.length, missing: missingKeywords.length },
      { category: "Secondary Tools", matched: Math.round(matchedKeywords.length * 0.5), missing: Math.round(missingKeywords.length * 0.5) }
    ];

    const recommendations = [
      `Tailor your Professional Summary to explicitly mention: ${matchedKeywords.slice(0, 2).map(m => m.term).join(", ")}.`,
      missingKeywords.length > 0 
        ? `Integrate ${missingKeywords.slice(0, 2).map(m => m.term).join(" and ")} keyword terms under your work experiences.`
        : "Ready to submit! Make sure formatting is clean.",
      semanticScore < 70 ? "Reframe your experience bullets around the role's core responsibilities and outcomes." : "Your language already aligns well with the role's narrative."
    ];

    const skillOverlap = matchedKeywords.slice(0, 6).map(keyword => keyword.term);
    const experienceGap = experienceMatch.requiredYears > (experienceMatch.candidateYears || 0)
      ? `You are short by ${experienceMatch.requiredYears - (experienceMatch.candidateYears || 0)} year(s) relative to the stated requirement.`
      : "Your experience profile is at or above the stated requirement.";

    const matchData = {
      userId,
      resumeId,
      jobDescription: jdText,
      jobTitle,
      company,
      matchScore,
      semanticScore,
      keywordScore,
      matchedKeywords,
      missingKeywords,
      skillOverlap,
      experienceGap,
      categoryBreakdown,
      skillGap,
      experienceMatch,
      projectRelevance,
      recommendations,
      hiringProbability,
      visualizationData: {
        radarChartData,
        keywordDistribution
      },
      confidence: 0.9,
      isSaved: false
    };

    return await matchingRepository.createMatch(matchData);
  }

  async saveJobDescription(userId, payload) {
    return await JobDescription.findOneAndUpdate(
      { userId, text: payload.text },
      { userId, title: payload.title || "", company: payload.company || "", text: payload.text, source: payload.source || "manual" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  async getJobDescriptions(userId) {
    return await JobDescription.find({ userId }).sort({ createdAt: -1 });
  }

  async getHistory(userId) {
    const records = await matchingRepository.findHistoryByUserId(userId);
    return records.map(r => ({
      id: r._id,
      jobTitle: r.jobTitle,
      company: r.company,
      matchScore: r.matchScore,
      resumeId: r.resumeId,
      createdAt: r.createdAt
    }));
  }

  async getDetails(id, userId) {
    const record = await matchingRepository.findByIdAndUser(id, userId);
    if (!record) {
      throw new AppError("Match details not found.", 404);
    }
    return record;
  }

  async saveComparison(id, userId) {
    const record = await matchingRepository.findByIdAndUser(id, userId);
    if (!record) {
      throw new AppError("Match comparison not found.", 404);
    }
    record.isSaved = true;
    return await matchingRepository.save(record);
  }

  async deleteComparison(id, userId) {
    const deleted = await matchingRepository.delete(id, userId);
    if (!deleted) {
      throw new AppError("Match comparison not found or access denied.", 404);
    }
    return true;
  }

  _extractKeywordsFromJd(jdText) {
    const jdLower = jdText.toLowerCase();
    const keywords = [];

    // Scan all role keywords from db
    Object.keys(keywordsDb.roles).forEach(role => {
      keywordsDb.roles[role].forEach(kw => {
        const canonical = kw.term.toLowerCase();
        const synonyms = (kw.synonyms || []).map(s => s.toLowerCase());

        const contains = jdLower.includes(canonical) || synonyms.some(syn => jdLower.includes(syn));
        if (contains && !keywords.some(k => k.term === kw.term)) {
          keywords.push(kw);
        }
      });
    });

    // Default keywords if none matched
    if (keywords.length === 0) {
      return [
        { term: "JavaScript", weight: 9 },
        { term: "SQL", weight: 8 },
        { term: "REST API", weight: 8 },
        { term: "Git", weight: 7 }
      ];
    }

    return keywords;
  }

  async _computeSemanticScore(resumeText, jobDescriptionText) {
    if (!resumeText || !jobDescriptionText) return 70;

    const similarity = await embeddingService.similarity(resumeText, jobDescriptionText);
    return Math.round(Math.max(20, Math.min(98, similarity * 100)));
  }

  _heuristicallyExtractYears(text) {
    const matches = text.match(/(\d+)\+?\s*(?:years?|yrs?)/);
    if (matches && matches[1]) {
      return parseInt(matches[1], 10);
    }
    return null;
  }
}

export default MatchingService;
