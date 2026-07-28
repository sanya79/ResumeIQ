import {
  FileScan,
  Target,
  Sparkles,
  Radar,
  MessageSquareText,
  ShieldCheck,
  Upload,
  Cpu,
  ScanSearch,
  Layers,
  FileCheck2,
} from "lucide-react";

/** Wordmark-only "trusted by" strip — plain typographic marks, not brand
 * logo artwork, since we don't hold rights to reproduce real logos. */
export const trustedCompanies = [
  "Google",
  "Microsoft",
  "Amazon",
  "Adobe",
  "Netflix",
  "Spotify",
  "GitHub",
];

export const features = [
  {
    icon: FileScan,
    title: "AI Resume Parser",
    description: "Extracts skills, roles, and achievements from any resume format in seconds.",
  },
  {
    icon: ShieldCheck,
    title: "ATS Intelligence",
    description: "Scores your resume the way applicant tracking systems actually read it.",
  },
  {
    icon: Target,
    title: "Job Matching",
    description: "Ranks your resume against a role and shows exactly where the gaps are.",
  },
  {
    icon: Radar,
    title: "Skill Gap Analysis",
    description: "Surfaces missing keywords and skills recruiters are filtering for.",
  },
  {
    icon: Sparkles,
    title: "AI Career Suggestions",
    description: "Personalized guidance on what to fix first for the biggest score lift.",
  },
  {
    icon: MessageSquareText,
    title: "Interview Preparation",
    description: "Generates likely interview questions based on your resume and target role.",
  },
] as const;

export const howItWorksSteps = [
  { icon: Upload, title: "Upload Resume", description: "Drop in a PDF or DOCX — no formatting required." },
  { icon: Cpu, title: "AI Processing", description: "Our models parse structure, roles, and context." },
  { icon: ScanSearch, title: "ATS Analysis", description: "Compatibility scored against real ATS behavior." },
  { icon: Layers, title: "Skill Detection", description: "Skills extracted and benchmarked against the role." },
  { icon: FileCheck2, title: "Get Personalized Report", description: "A clear, prioritized action plan." },
] as const;

export const atsBreakdown = [
  { label: "Keyword Match", value: 92 },
  { label: "Experience", value: 84 },
  { label: "Projects", value: 78 },
  { label: "Formatting", value: 95 },
  { label: "Education", value: 88 },
] as const;

export const aiRecommendations = [
  "Add measurable achievements",
  "Improve keyword density",
  "Add GitHub profile",
  "Rewrite project description",
] as const;

export const testimonials = [
  {
    name: "Priya Sharma",
    role: "Software Engineer",
    quote:
      "The ATS score breakdown showed me exactly why my resume wasn't landing interviews. Fixed it in an afternoon.",
  },
  {
    name: "Daniel Cho",
    role: "Product Manager",
    quote: "Job matching flagged three skills I hadn't thought to highlight. Interview rate went up noticeably.",
  },
  {
    name: "Amara Okafor",
    role: "Data Analyst",
    quote: "Feels like having a recruiter review my resume, minus the wait and the vague feedback.",
  },
  {
    name: "Lucas Bennett",
    role: "UX Designer",
    quote: "The skill gap analysis is scarily accurate. Cleared up a lot of guesswork.",
  },
  {
    name: "Hana Kim",
    role: "Marketing Lead",
    quote: "Interview prep questions were close to what I actually got asked. Genuinely useful.",
  },
] as const;

export const faqs = [
  {
    id: "faq-1",
    question: "How does ResumeIQ score my resume?",
    answer:
      "We analyze keyword match, formatting, experience relevance, and structure against patterns real ATS platforms use, then combine that into a single 0–100 score with a breakdown you can act on.",
  },
  {
    id: "faq-2",
    question: "What file formats are supported?",
    answer: "PDF and DOCX are supported today. We recommend exporting from Word or Google Docs as a PDF for best parsing accuracy.",
  },
  {
    id: "faq-3",
    question: "Is my resume data kept private?",
    answer: "Yes. Your resume is used only to generate your analysis and is never shared with third parties or used to train external models.",
  },
  {
    id: "faq-4",
    question: "Can I match my resume against a specific job posting?",
    answer: "Yes — paste a job description and ResumeIQ scores your resume against that specific role, highlighting matched and missing skills.",
  },
  {
    id: "faq-5",
    question: "Do I need an account to try it?",
    answer: "You can run a free analysis without creating an account. A free account lets you save reports and track score improvements over time.",
  },
] as const;

export const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
];

export const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#" },
    { label: "How it works", href: "#how-it-works" },
  ],
  Company: [
    { label: "Contact", href: "#" },
    { label: "Privacy", href: "#" },
  ],
  Resources: [{ label: "GitHub", href: "#" }],
};
