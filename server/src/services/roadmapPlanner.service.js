export class RoadmapPlannerService {
  async generatePlan({ targetRole, missingSkills = [], resumeText = "", skillGap = [] }) {
    throw new Error("RoadmapPlannerService.generatePlan must be implemented.");
  }
}

export class RulesBasedRoadmapPlannerService extends RoadmapPlannerService {
  async generatePlan({ targetRole, missingSkills = [], resumeText = "", skillGap = [] }) {
    const role = targetRole || "target role";
    const primarySkills = missingSkills.slice(0, 4);
    const monthlyPlan = [
      {
        month: "Month 1",
        focus: `Build the fundamentals most relevant to ${role}`,
        resources: primarySkills.length > 0 ? primarySkills : ["Core concepts", "Hands-on practice"],
      },
      {
        month: "Month 2",
        focus: "Ship a portfolio project that demonstrates the new skills",
        resources: ["Portfolio project", "Code review", "Documentation"],
      },
      {
        month: "Month 3",
        focus: "Practice interviews and tighten your leadership storytelling",
        resources: ["Mock interviews", "Behavioral stories", "Resume rewrites"],
      },
    ];

    const certifications = [
      {
        id: "cert-roadmap-1",
        title: `${role} focused learning certificate`,
        provider: "Coursera",
        difficulty: "Intermediate",
        estimatedTime: "4 weeks",
        description: "A structured short course to strengthen your fundamentals and portfolio.",
      },
    ];

    const courses = [
      {
        id: "course-roadmap-1",
        title: `Hands-on ${role} learning path`,
        provider: "Udemy",
        difficulty: "Intermediate",
        estimatedHours: 20,
        category: "Courses",
      },
    ];

    const projects = [
      {
        id: "project-roadmap-1",
        title: `${role} practice project`,
        difficulty: "Intermediate",
        technologies: primarySkills.length > 0 ? primarySkills : ["Core stack"],
        estimatedTime: "3 weeks",
        skillsCovered: primarySkills.length > 0 ? primarySkills : ["Problem solving"],
      },
    ];

    const practiceProblems = [
      "Solve 20 coding problems focused on the missing skills",
      "Build one case-study writeup for each portfolio project",
    ];

    const interviewMilestones = [
      "Complete one mock technical interview",
      "Practice a concise explanation of your project outcomes",
    ];

    const jobReadinessScore = Math.min(98, 50 + Math.max(0, primarySkills.length * 8));

    return {
      monthlyPlan,
      certifications,
      courses,
      projects,
      practiceProblems,
      interviewMilestones,
      jobReadinessScore,
    };
  }
}

export default RulesBasedRoadmapPlannerService;
