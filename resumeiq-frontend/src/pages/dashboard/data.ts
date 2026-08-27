import type { TimelineStep } from "@/components/cards/TimelineCard";

/**
 * ⚠️ PLACEHOLDER DATA
 * The dashboard currently renders against static mock data — no
 * resume/ats/matching API service exists yet (see project analysis).
 * Once those services are built, replace these constants with React Query
 * hooks that call them; component props are already shaped to make that a
 * drop-in swap rather than a rewrite.
 */

export type ScoreTrendDirection = "up" | "down";

export interface ScoreCardDatum {
  id: string;
  label: string;
  value: number; // 0-100
  trend: { value: number; direction: ScoreTrendDirection };
  visual: "ring" | "heart" | "bars" | "check";
  description: string;
}

export const scoreCards: ScoreCardDatum[] = [
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
];

export interface QuickActionDatum {
  id: string;
  label: string;
  description: string;
  href: string;
  gradient: "primary" | "warm" | "success";
}

export const quickActions: QuickActionDatum[] = [
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
];

export interface InsightGroup {
  id: string;
  title: string;
  tone: "emerald" | "danger" | "cyan" | "purple";
  items: string[];
}

export const insightGroups: InsightGroup[] = [
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
];

export const recentActivity: TimelineStep[] = [
  { title: "Resume uploaded", description: "Senior_Frontend_Resume_v4.pdf · 2 hours ago", status: "complete" },
  { title: "ATS analyzed", description: "Scored 87/100 · 2 hours ago", status: "complete" },
  { title: "Job matched", description: "3 new matches found · 1 hour ago", status: "complete" },
  { title: "Interview generated", description: "8 tailored questions ready", status: "current" },
];

export interface CareerProgressDatum {
  label: string;
  value: number;
  description: string;
}

export const careerProgress: CareerProgressDatum[] = [
  { label: "Profile Completion", value: 100, description: "All core details filled in." },
  { label: "Resume Completion", value: 88, description: "One section still needs quantified results." },
  { label: "LinkedIn", value: 70, description: "Headline and summary could be sharper." },
  { label: "GitHub", value: 45, description: "Pin your best 3 repositories." },
  { label: "Portfolio", value: 20, description: "Add a live link to stand out." },
];

export const resumeScoreHistory = [
  { month: "Feb", score: 61 },
  { month: "Mar", score: 68 },
  { month: "Apr", score: 72 },
  { month: "May", score: 76 },
  { month: "Jun", score: 81 },
  { month: "Jul", score: 87 },
];

export const atsTrend = [
  { month: "Feb", keyword: 58, formatting: 70, readability: 65 },
  { month: "Mar", keyword: 64, formatting: 74, readability: 68 },
  { month: "Apr", keyword: 69, formatting: 78, readability: 74 },
  { month: "May", keyword: 75, formatting: 82, readability: 79 },
  { month: "Jun", keyword: 81, formatting: 86, readability: 83 },
  { month: "Jul", keyword: 88, formatting: 90, readability: 87 },
];

export const applicationsSent = [
  { week: "W1", applications: 4 },
  { week: "W2", applications: 7 },
  { week: "W3", applications: 5 },
  { week: "W4", applications: 9 },
  { week: "W5", applications: 6 },
  { week: "W6", applications: 11 },
];

export const interviewRate = [
  { week: "W1", rate: 12 },
  { week: "W2", rate: 18 },
  { week: "W3", rate: 15 },
  { week: "W4", rate: 24 },
  { week: "W5", rate: 21 },
  { week: "W6", rate: 30 },
];

export const aiTip =
  "Recruiters skim resumes for 6–8 seconds first pass — put your strongest, most quantified bullet first in every role.";

export const careerQuote = {
  quote: "Opportunities don't happen. You create them.",
  author: "Chris Grosser",
};

export const upcomingInterview = {
  role: "Senior Frontend Engineer",
  company: "Nimbus Systems",
  date: "Tomorrow, 3:00 PM",
};
