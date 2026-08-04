import crypto from "crypto";
import { CareerRepository } from "../repositories/career.repository.js";
import { ResumeRepository } from "../repositories/resume.repository.js";
import { keywordsDb } from "../ats/config/keywords.db.js";
import { AppError } from "../utils/appError.js";
import { RulesBasedRoadmapPlannerService } from "./roadmapPlanner.service.js";

const careerRepository = new CareerRepository();
const resumeRepository = new ResumeRepository();
const roadmapPlannerService = new RulesBasedRoadmapPlannerService();

export class CareerService {
  async analyzeRoadmap(userId, resumeId, targetRole) {
    const resume = await resumeRepository.findByIdAndUser(resumeId, userId);
    if (!resume) {
      throw new AppError("Resume not found or access denied.", 404);
    }

    // Heuristically detect skills present in resume
    const candidateSkills = this._extractSkillsFromResume(resume);
    const dbKey = this._mapTargetRoleToDbKey(targetRole);
    const requiredSkills = keywordsDb.roles[dbKey] || [];

    // 1. Skill Gap Analysis
    const skillGap = [];
    const radarChartData = [];
    let totalWeight = 0;
    let matchedWeight = 0;

    requiredSkills.forEach(skill => {
      const canonical = skill.term.toLowerCase();
      const synonyms = (skill.synonyms || []).map(s => s.toLowerCase());

      const isMatched = candidateSkills.technical.some(s => 
        s === canonical || synonyms.includes(s)
      ) || candidateSkills.rawText.includes(canonical) || synonyms.some(syn => candidateSkills.rawText.includes(syn));

      const requiredLevel = skill.weight * 10;
      const currentLevel = isMatched ? Math.floor(Math.random() * 16) + 80 : Math.floor(Math.random() * 21) + 10; // 80-95 if matched, 10-30 if not
      const gap = Math.max(requiredLevel - currentLevel, 0);

      totalWeight += skill.weight;
      if (isMatched) {
        matchedWeight += skill.weight;
      }

      skillGap.push({
        id: crypto.randomUUID(),
        category: skill.term,
        currentLevel,
        requiredLevel,
        gap,
        explanation: gap > 0 
          ? `Your profile shows limited evidence of ${skill.term}. Developing this will strengthen your alignment for ${targetRole} positions.`
          : `Excellent! You demonstrate solid command of ${skill.term}, matching the role requirements.`
      });

      radarChartData.push({
        subject: skill.term,
        current: currentLevel,
        required: requiredLevel,
        fullMark: 100
      });
    });

    // Compute readiness score (0-100)
    const matchRatio = totalWeight > 0 ? matchedWeight / totalWeight : 1.0;
    const careerReadinessScore = Math.round(matchRatio * 100);

    let readinessStatus = "Needs Improvement";
    let estimatedTimeToTarget = "6-9 months";
    if (careerReadinessScore >= 80) {
      readinessStatus = "Excellent Candidate";
      estimatedTimeToTarget = "Ready";
    } else if (careerReadinessScore >= 50) {
      readinessStatus = "Almost Ready";
      estimatedTimeToTarget = "2-4 months";
    }

    const missingSkills = skillGap.filter(item => item.gap > 20).map(item => item.category);
    const plannerOutput = await roadmapPlannerService.generatePlan({
      targetRole,
      missingSkills,
      resumeText: resume.rawText || "",
      skillGap,
    });

    // 2. Build personalized Roadmap steps
    const roadmap = [];
    const monthlyPlan = plannerOutput.monthlyPlan || [];

    monthlyPlan.forEach((step, idx) => {
      roadmap.push({
        id: `step_${idx + 1}`,
        order: idx + 1,
        title: step.focus,
        description: `${step.focus} • ${step.resources.join(", ")}`,
        estimatedDuration: step.month,
        difficulty: idx === 0 ? "Beginner" : idx === 1 ? "Intermediate" : "Advanced",
        priority: idx === 2 ? "High" : "Medium",
        status: "not-started",
        skillsCovered: step.resources.slice(0, 3),
      });
    });

    if (roadmap.length === 0) {
      const defaultSteps = [
      {
        title: "Review Foundational Concepts",
        description: `Strengthen core theory and basic syntax relating to your target role: ${targetRole}.`,
        estimatedDuration: "2 weeks",
        difficulty: "Beginner",
        priority: "Medium",
        skillsCovered: missingSkills.slice(0, 2)
      },
      {
        title: "Develop Practical Projects",
        description: `Build hands-on coding prototypes. Focus on implementing missing keywords like ${missingSkills.slice(0, 3).join(", ") || "core patterns"}.`,
        estimatedDuration: "4 weeks",
        difficulty: "Intermediate",
        priority: "High",
        skillsCovered: missingSkills.slice(0, 4)
      },
      {
        title: "System Design and Architecture",
        description: `Understand architectural patterns, database modeling, or infrastructure dependencies relevant to ${targetRole}.`,
        estimatedDuration: "3 weeks",
        difficulty: "Advanced",
        priority: "High",
        skillsCovered: missingSkills.slice(2, 5)
      },
      {
        title: "Mock Interview & Portfolio Prep",
        description: "Polish resume items, do mock technical Q&As, and prepare case studies.",
        estimatedDuration: "2 weeks",
        difficulty: "Intermediate",
        priority: "Medium",
        skillsCovered: []
      }
    ];

      defaultSteps.forEach((step, idx) => {
        roadmap.push({
          id: `step_${idx + 1}`,
          order: idx + 1,
          title: step.title,
          description: step.description,
          estimatedDuration: step.estimatedDuration,
          difficulty: step.difficulty,
          priority: step.priority,
          status: "not-started",
          skillsCovered: step.skillsCovered.length > 0 ? step.skillsCovered : ["General Alignment"]
        });
      });
    }

    // 3. Recommended Certifications
    const certifications = plannerOutput.certifications || this._generateCertifications(dbKey);

    // 4. Learning Resources
    const learningResources = plannerOutput.courses || this._generateLearningResources(dbKey, missingSkills);

    // 5. Portfolio Project Recommendations
    const projectRecommendations = plannerOutput.projects || this._generateProjectRecommendations(dbKey, missingSkills);

    // 6. Career Timeline
    const careerTimeline = [
      { id: "stop_1", phase: "Current Position", label: "Initial Assessment", estimate: "Now", status: "complete" },
      { id: "stop_2", phase: "Learning Phase", label: "Acquiring Skill Gaps", estimate: "Month 1-2", status: "current" },
      { id: "stop_3", phase: "Project Building", label: "Portfolio Development", estimate: "Month 3", status: "upcoming" },
      { id: "stop_4", phase: "Interview Ready", label: "Mock Practices", estimate: "Month 4", status: "upcoming" },
      { id: "stop_5", phase: "Target Role", label: `Land ${targetRole} Job`, estimate: estimatedTimeToTarget === "Ready" ? "Immediate" : estimatedTimeToTarget, status: "upcoming" }
    ];

    // 7. AI Insights
    const insights = [
      {
        id: "insight_1",
        type: "biggest-strength",
        title: "Strong Foundation",
        detail: `Your resume shows solid alignment in several core categories. Leverage this background during application screenings.`
      },
      {
        id: "insight_2",
        type: "critical-gap",
        title: "Missing Skillsets",
        detail: missingSkills.length > 0
          ? `Missing ${missingSkills.slice(0, 2).join(" and ")} is currently dragging down your ATS ranking for ${targetRole} positions.`
          : "You exhibit excellent keyword coverage. Keep updating your portfolio with new releases."
      },
      {
        id: "insight_3",
        type: "fastest-improvement",
        title: "High Yield Tasks",
        detail: `Adding a dedicated sections or projects mentioning ${missingSkills[0] || "core tools"} will yield the quickest ATS score jump.`
      },
      {
        id: "insight_4",
        type: "career-advice",
        title: "Strategic Learning",
        detail: "Focus on build-before-you-apply. Deploy small mini-projects rather than reading documentation extensively."
      }
    ];

    const roadmapData = {
      userId,
      resumeId,
      targetRole,
      careerReadinessScore,
      readinessStatus,
      estimatedTimeToTarget,
      skillGap,
      radarChartData,
      roadmap,
      certifications,
      learningResources,
      projectRecommendations,
      careerTimeline,
      insights,
      confidence: 0.95,
      skillGapSummary: {
        targetRole,
        missingSkills: missingSkills.map((skill) => ({ skill, confidence: 0.8, priority: missingSkills.indexOf(skill) === 0 ? "High" : "Medium" })),
      },
      roadmapPlan: {
        monthlyPlan: plannerOutput.monthlyPlan || [],
        practiceProblems: plannerOutput.practiceProblems || [],
        interviewMilestones: plannerOutput.interviewMilestones || [],
        jobReadinessScore: plannerOutput.jobReadinessScore ?? careerReadinessScore,
      },
    };

    return await careerRepository.createRoadmap(roadmapData);
  }

  async updateStepStatus(userId, resultId, stepId, status) {
    const roadmapRecord = await careerRepository.findByIdAndUser(resultId, userId);
    if (!roadmapRecord) {
      throw new AppError("Roadmap not found or access denied.", 404);
    }

    const steps = roadmapRecord.roadmap || [];
    const step = steps.find(s => s.id === stepId);
    if (step) {
      step.status = status;
      roadmapRecord.markModified("roadmap");
      await careerRepository.save(roadmapRecord);
    }

    return roadmapRecord.roadmap;
  }

  _extractSkillsFromResume(resume) {
    const skills = { technical: [], soft: [], rawText: "" };
    if (resume.rawText) {
      skills.rawText = resume.rawText.toLowerCase();
    }
    
    // Retrieve skills from scorecard if any, or default parse
    if (resume.atsScorecard && Array.isArray(resume.atsScorecard.breakdown)) {
      const keywordItem = resume.atsScorecard.breakdown.find(b => b.id === "keyword_relevance");
      if (keywordItem && Array.isArray(keywordItem.evidence)) {
        keywordItem.evidence.forEach(ev => {
          const match = ev.match(/'([^']+)'/);
          if (match && match[1]) {
            skills.technical.push(match[1].toLowerCase());
          }
        });
      }
    }
    
    return skills;
  }

  _mapTargetRoleToDbKey(roleName) {
    const norm = roleName.toLowerCase();
    if (norm.includes("frontend") || norm.includes("ui") || norm.includes("ux") || norm.includes("design")) return "frontend";
    if (norm.includes("backend")) return "backend";
    if (norm.includes("full stack") || norm.includes("fullstack")) return "fullstack";
    if (norm.includes("machine learning") || norm.includes("ml") || norm.includes("ai")) return "ai_engineer";
    if (norm.includes("data scientist") || norm.includes("data analyst") || norm.includes("data science")) return "ml_engineer";
    if (norm.includes("devops") || norm.includes("cloud") || norm.includes("security") || norm.includes("infrastructure")) return "devops";
    return "fullstack";
  }

  _generateCertifications(dbKey) {
    switch (dbKey) {
      case "frontend":
        return [
          { id: "cert_1", title: "Meta Front-End Developer Professional Certificate", provider: "Coursera", difficulty: "Intermediate", estimatedTime: "6 weeks", description: "Comprehensive frontend specialization by Meta." }
        ];
      case "backend":
        return [
          { id: "cert_2", title: "Node.js Application Development (LFW211)", provider: "Linux Foundation", difficulty: "Advanced", estimatedTime: "8 weeks", description: "Official certification for Node application patterns." }
        ];
      case "devops":
        return [
          { id: "cert_3", title: "AWS Certified DevOps Engineer", provider: "Amazon Web Services", difficulty: "Advanced", estimatedTime: "12 weeks", description: "Industry-standard DevOps verification." }
        ];
      default:
        return [
          { id: "cert_4", title: "Google IT Support Professional Certificate", provider: "Google", difficulty: "Beginner", estimatedTime: "4 weeks", description: "Foundational cloud and administration certificate." }
        ];
    }
  }

  _generateLearningResources(dbKey, missingSkills) {
    const label = missingSkills[0] || "Advanced Core Concepts";
    return [
      { id: "res_1", title: `Mastering ${label} Complete Course`, provider: "Udemy", difficulty: "Intermediate", estimatedHours: 20, category: "Courses", url: "https://udemy.com" },
      { id: "res_2", title: `${label} Crash Course & Best Practices`, provider: "YouTube", difficulty: "Beginner", estimatedHours: 3, category: "Videos", url: "https://youtube.com" },
      { id: "res_3", title: `Eloquent JavaScript and patterns`, provider: "Marijn Haverbeke", difficulty: "Intermediate", estimatedHours: 15, category: "Books" },
      { id: "res_4", title: "LeetCode interview practice problems", provider: "LeetCode", difficulty: "Advanced", estimatedHours: 40, category: "Practice Platforms", url: "https://leetcode.com" }
    ];
  }

  _generateProjectRecommendations(dbKey, missingSkills) {
    const primary = missingSkills[0] || "Advanced API Integration";
    const secondary = missingSkills[1] || "Database Engine";
    return [
      {
        id: "proj_1",
        title: `Fullstack SaaS Dashboard leveraging ${primary}`,
        difficulty: "Intermediate",
        technologies: [primary, "React", "Node.js"],
        estimatedTime: "3 weeks",
        skillsCovered: [primary, "Authentication", "Deployment"]
      },
      {
        id: "proj_2",
        title: `High Performance Distributed system with ${secondary}`,
        difficulty: "Advanced",
        technologies: [secondary, "Docker", "Go"],
        estimatedTime: "4 weeks",
        skillsCovered: [secondary, "Scaling", "Concurrency"]
      }
    ];
  }
}

export default CareerService;
