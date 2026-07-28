/**
 * ResumeIQ ATS Scoring Rules Configuration
 * Every rule has a unique ID, description, configurable weight, status, and version.
 * Modify weights here to adjust the global scoring model.
 */
export const rulesConfig = {
  version: "1.0.0",
  rules: [
    {
      id: "section_completeness",
      name: "Section Completeness",
      description: "Checks if essential sections (Summary, Experience, Projects, Education, Skills, Contact) exist in the resume.",
      weight: 20,
      enabled: true,
      version: "1.0.0"
    },
    {
      id: "keyword_relevance",
      name: "Keyword Relevance",
      description: "Matches resume skills against target job role keywords and aliases.",
      weight: 20,
      enabled: true,
      version: "1.0.0"
    },
    {
      id: "experience_quality",
      name: "Experience Quality",
      description: "Evaluates duration, career progress, role consistency, and employment details.",
      weight: 15,
      enabled: true,
      version: "1.0.0"
    },
    {
      id: "project_quality",
      name: "Project Quality",
      description: "Assesses project complexity, description depth, technical diversity, and external link availability.",
      weight: 15,
      enabled: true,
      version: "1.0.0"
    },
    {
      id: "formatting_quality",
      name: "Formatting Quality",
      description: "Detects text length density, empty spacing, and potential structure layout inconsistencies.",
      weight: 10,
      enabled: true,
      version: "1.0.0"
    },
    {
      id: "readability_quality",
      name: "Readability & Syntax",
      description: "Evaluates sentence lengths, formatting style consistency, and limits passive voice usage.",
      weight: 5,
      enabled: true,
      version: "1.0.0"
    },
    {
      id: "education_quality",
      name: "Education Quality",
      description: "Scores academic levels, institutions, GPA patterns, and graduation status.",
      weight: 5,
      enabled: true,
      version: "1.0.0"
    },
    {
      id: "impact_metrics",
      name: "Impact & Quantifiability",
      description: "Rewards the inclusion of measurable metrics like percentages, growth, speed limits, and financial indicators.",
      weight: 5,
      enabled: true,
      version: "1.0.0"
    },
    {
      id: "leadership_indicators",
      name: "Leadership Indicators",
      description: "Checks for mentoring, leading, planning, or organizational action verbs.",
      weight: 3,
      enabled: true,
      version: "1.0.0"
    },
    {
      id: "certification_quality",
      name: "Certifications & Recency",
      description: "Grades credentials relevance, issuing authorities, and expiry parameters.",
      weight: 2,
      enabled: true,
      version: "1.0.0"
    }
  ]
};
