import { Resume } from "../models/Resume.js";
import { InterviewSession } from "../models/InterviewSession.js";
import { JobMatch } from "../models/JobMatch.js";
import { CareerRoadmap } from "../models/CareerRoadmap.js";

const DEFAULT_OVERVIEW = {
  scoreCards: [
    {
      id: "ats-score",
      label: "ATS Score",
      value: 87,
      trend: { value: 8, direction: "up" },
      visual: "ring",
      description: "How well your resume clears automated screening.",
    },
    {
      id: "resume-health",
      label: "Resume Health",
      value: 94,
      trend: { value: 3, direction: "up" },
      visual: "heart",
      description: "Structure, clarity, and completeness combined.",
    },
    {
      id: "job-match",
      label: "Job Match",
      value: 82,
      trend: { value: 5, direction: "up" },
      visual: "bars",
      description: "Average fit across your active job matches.",
    },
    {
      id: "interview-ready",
      label: "Interview Ready",
      value: 91,
      trend: { value: 2, direction: "down" },
      visual: "check",
      description: "Readiness based on your last practice session.",
    },
  ],
  quickActions: [
    {
      id: "upload",
      label: "Upload Resume",
      description: "Add a new version for parsing and scoring.",
      href: "/resumes/upload",
      gradient: "primary",
    },
    {
      id: "analyze",
      label: "Analyze Resume",
      description: "Run the full ATS breakdown on your latest file.",
      href: "/ats",
      gradient: "success",
    },
    {
      id: "suggestions",
      label: "Generate AI Suggestions",
      description: "Get targeted rewrites for your weakest sections.",
      href: "/resumes",
      gradient: "warm",
    },
    {
      id: "match",
      label: "Match Job Description",
      description: "Compare your resume against a posting.",
      href: "/matching",
      gradient: "primary",
    },
    {
      id: "interview",
      label: "Practice Interview",
      description: "Start an AI-generated mock interview.",
      href: "/interview",
      gradient: "success",
    },
  ],
  insightGroups: [
    {
      id: "strong-skills",
      title: "Strong Skills",
      tone: "emerald",
      items: ["React & TypeScript", "System design", "Team leadership", "API architecture"],
    },
    {
      id: "weak-skills",
      title: "Weak Skills",
      tone: "danger",
      items: ["Cloud cost optimization", "Public speaking", "Data visualization"],
    },
    {
      id: "ats-issues",
      title: "ATS Issues",
      tone: "cyan",
      items: [
        "Missing quantified impact in 2 of 4 roles",
        "Contact section formatting may confuse parsers",
        "Skills section could use 3 more target keywords",
      ],
    },
    {
      id: "suggestions",
      title: "Resume Suggestions",
      tone: "purple",
      items: [
        "Lead bullet points with outcomes, not responsibilities",
        "Add a metrics-driven summary line at the top",
        "Trim the projects section to your 3 strongest entries",
      ],
    },
  ],
  recentActivity: [
    { title: "Resume uploaded", description: "Senior_Frontend_Resume_v4.pdf · 2 hours ago", status: "complete" },
    { title: "ATS analyzed", description: "Scored 87/100 · 2 hours ago", status: "complete" },
    { title: "Job matched", description: "3 new matches found · 1 hour ago", status: "complete" },
    { title: "Interview generated", description: "8 tailored questions ready", status: "current" },
  ],
  careerProgress: [
    { label: "Profile Completion", value: 100, description: "All core details filled in." },
    { label: "Resume Completion", value: 88, description: "One section still needs quantified results." },
    { label: "LinkedIn", value: 70, description: "Headline and summary could be sharper." },
    { label: "GitHub", value: 45, description: "Pin your best 3 repositories." },
    { label: "Portfolio", value: 20, description: "Add a live link to stand out." },
  ],
  resumeScoreHistory: [
    { month: "Feb", score: 61 },
    { month: "Mar", score: 68 },
    { month: "Apr", score: 72 },
    { month: "May", score: 76 },
    { month: "Jun", score: 81 },
    { month: "Jul", score: 87 },
  ],
  atsTrend: [
    { month: "Feb", keyword: 58, formatting: 70, readability: 65 },
    { month: "Mar", keyword: 64, formatting: 74, readability: 68 },
    { month: "Apr", keyword: 69, formatting: 78, readability: 74 },
    { month: "May", keyword: 75, formatting: 82, readability: 79 },
    { month: "Jun", keyword: 81, formatting: 86, readability: 83 },
    { month: "Jul", keyword: 88, formatting: 90, readability: 87 },
  ],
  applicationsSent: [
    { week: "W1", applications: 4 },
    { week: "W2", applications: 7 },
    { week: "W3", applications: 5 },
    { week: "W4", applications: 9 },
    { week: "W5", applications: 6 },
    { week: "W6", applications: 11 },
  ],
  interviewRate: [
    { week: "W1", rate: 12 },
    { week: "W2", rate: 18 },
    { week: "W3", rate: 15 },
    { week: "W4", rate: 24 },
    { week: "W5", rate: 21 },
    { week: "W6", rate: 30 },
  ],
  aiTip: "Recruiters skim resumes for 6–8 seconds first pass — put your strongest, most quantified bullet first in every role.",
  careerQuote: {
    quote: "Opportunities don't happen. You create them.",
    author: "Chris Grosser",
  },
  upcomingInterview: {
    role: "Senior Frontend Engineer",
    company: "Nimbus Systems",
    date: "Tomorrow, 3:00 PM",
  },
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getLatestResumeMetrics(latestResume) {
  const score = latestResume?.atsScorecard?.overallScore ?? DEFAULT_OVERVIEW.scoreCards[0].value;
  const lastScore = Number(score) || DEFAULT_OVERVIEW.scoreCards[0].value;
  const jobMatch = latestResume?.atsScorecard?.overallScore ? clamp(Math.round(lastScore * 0.94), 0, 100) : DEFAULT_OVERVIEW.scoreCards[2].value;
  const interviewReady = latestResume?.atsScorecard?.estimatedImprovedScore ? clamp(Math.round(latestResume.atsScorecard.estimatedImprovedScore), 0, 100) : DEFAULT_OVERVIEW.scoreCards[3].value;

  return {
    atsScore: lastScore,
    resumeHealth: clamp(Math.round((lastScore + 92) / 2), 0, 100),
    jobMatch,
    interviewReady,
  };
}

function deriveInsightGroups(latestResume) {
  const strengths = latestResume?.atsScorecard?.strengths || ["React & TypeScript", "System design", "Team leadership", "API architecture"];
  const weakAreas = latestResume?.atsScorecard?.weakAreas || ["Cloud cost optimization", "Public speaking", "Data visualization"];
  const issues = latestResume?.atsScorecard?.top10Improvements || [
    "Missing quantified impact in 2 of 4 roles",
    "Contact section formatting may confuse parsers",
    "Skills section could use 3 more target keywords",
  ];

  return [
    {
      id: "strong-skills",
      title: "Strong Skills",
      tone: "emerald",
      items: strengths.slice(0, 4),
    },
    {
      id: "weak-skills",
      title: "Weak Skills",
      tone: "danger",
      items: weakAreas.slice(0, 3),
    },
    {
      id: "ats-issues",
      title: "ATS Issues",
      tone: "cyan",
      items: issues.slice(0, 3),
    },
    {
      id: "suggestions",
      title: "Resume Suggestions",
      tone: "purple",
      items: [
        "Lead bullet points with outcomes, not responsibilities",
        "Add a metrics-driven summary line at the top",
        "Trim the projects section to your 3 strongest entries",
      ],
    },
  ];
}

function deriveResumeScoreHistory(latestResume, recentResumes) {
  if (recentResumes && recentResumes.length > 0) {
    return recentResumes
      .slice(0, 6)
      .reverse()
      .map((resume, index) => {
        const monthLabel = resume.createdAt ? new Date(resume.createdAt).toLocaleString("default", { month: "short" }) : `M${index + 1}`;
        const realScore = Number(resume?.atsScorecard?.overallScore) || 75;
        return {
          month: monthLabel,
          score: realScore,
        };
      });
  }

  const currentScore = Number(latestResume?.atsScorecard?.overallScore) || 75;
  return [
    { month: "Initial", score: Math.max(50, currentScore - 5) },
    { month: "Latest", score: currentScore },
  ];
}

export async function buildAnalyticsOverview(userId) {
  const [latestResume, recentResumes, interviewSessions, matches, roadmaps] = await Promise.all([
    Resume.findOne({ userId, isDeleted: false, isLatest: true }).sort({ createdAt: -1 }).lean(),
    Resume.find({ userId, isDeleted: false }).sort({ createdAt: -1 }).limit(6).lean(),
    InterviewSession.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
    JobMatch.find({ userId }).sort({ createdAt: -1 }).limit(10).lean(),
    CareerRoadmap.find({ userId }).sort({ createdAt: -1 }).limit(3).lean(),
  ]);

  const metrics = getLatestResumeMetrics(latestResume);
  const chartHistory = deriveResumeScoreHistory(latestResume, recentResumes);

  const overview = {
    ...DEFAULT_OVERVIEW,
    scoreCards: [
      {
        ...DEFAULT_OVERVIEW.scoreCards[0],
        value: metrics.atsScore,
        trend: { value: 8, direction: "up" },
      },
      {
        ...DEFAULT_OVERVIEW.scoreCards[1],
        value: metrics.resumeHealth,
      },
      {
        ...DEFAULT_OVERVIEW.scoreCards[2],
        value: metrics.jobMatch,
      },
      {
        ...DEFAULT_OVERVIEW.scoreCards[3],
        value: metrics.interviewReady,
      },
    ],
    insightGroups: deriveInsightGroups(latestResume),
    recentActivity: recentResumes && recentResumes.length > 0
      ? [
          { title: "Resume uploaded", description: `${recentResumes[0].originalName} · ${new Date(recentResumes[0].createdAt).toLocaleDateString()}`, status: "complete" },
          { title: "ATS analyzed", description: `Scored ${metrics.atsScore}/100`, status: "complete" },
          { title: "Job matches refreshed", description: `${matches.length} recent matches`, status: "complete" },
          { title: "Interview session ready", description: interviewSessions[0]?.role || "Practice interview queued", status: "current" },
        ]
      : DEFAULT_OVERVIEW.recentActivity,
    careerProgress: [
      { label: "Profile Completion", value: 100, description: "All core details filled in." },
      { label: "Resume Completion", value: clamp(Math.round((metrics.atsScore + 70) / 2), 0, 100), description: "One section still needs quantified results." },
      { label: "LinkedIn", value: clamp(Math.round((metrics.atsScore + 40) / 2), 0, 100), description: "Headline and summary could be sharper." },
      { label: "GitHub", value: 45, description: "Pin your best 3 repositories." },
      { label: "Portfolio", value: 20, description: "Add a live link to stand out." },
    ],
    resumeScoreHistory: chartHistory,
    aiTip: latestResume?.comparisonSummary || DEFAULT_OVERVIEW.aiTip,
    upcomingInterview: interviewSessions[0]
      ? {
          role: interviewSessions[0].role || "Senior Frontend Engineer",
          company: interviewSessions[0].company || "Nimbus Systems",
          date: interviewSessions[0].createdAt ? `Scheduled ${new Date(interviewSessions[0].createdAt).toLocaleDateString()}` : "Tomorrow, 3:00 PM",
        }
      : DEFAULT_OVERVIEW.upcomingInterview,
  };

  return overview;
}

export default buildAnalyticsOverview;
