import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import fs from "fs";
import path from "path";
import { AppError } from "../utils/appError.js";

/**
 * Pluggable parser service interface for resume extraction.
 * The current implementation is deterministic and local, but callers do not
 * depend on the concrete parser so an LLM-backed parser can replace it later.
 */
export class ResumeParserService {
  async extractText(filePath, originalName) {
    throw new Error("ResumeParserService.extractText must be implemented.");
  }

  parse(rawText, originalName) {
    throw new Error("ResumeParserService.parse must be implemented.");
  }
}

export class LocalResumeParserService extends ResumeParserService {
  async extractText(filePath, originalName) {
    const ext = path.extname(originalName).toLowerCase();
    const fileBuffer = fs.readFileSync(filePath);

    if (ext === ".pdf") {
      const data = await pdfParse(fileBuffer);
      return data.text || "";
    }

    if (ext === ".docx") {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return result.value || "";
    }

    throw new AppError("Invalid extension. Only PDF and DOCX uploads supported.", 400);
  }

  parse(rawText, originalName) {
    const textLower = rawText.toLowerCase();

    const emailMatch = rawText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/);
    const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/);
    const githubMatch = rawText.match(/github\.com\/([A-Za-z0-9_-]+)/i);
    const linkedinMatch = rawText.match(/linkedin\.com\/in\/([A-Za-z0-9_-]+)/i);

    let name = originalName.split(".")[0].replace(/[_-]/g, " ");
    const lines = rawText.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
    if (lines.length > 0 && lines[0].split(" ").length <= 4) {
      name = lines[0];
    }

    const sections = {
      summary: "",
      experience: [],
      projects: [],
      education: [],
      skills: { technical: [], soft: [] },
      certifications: [],
    };

    const technicalKeywords = [
      "javascript", "typescript", "python", "java", "golang", "rust", "react", "next.js",
      "vue", "angular", "node.js", "express", "mongodb", "postgresql", "mysql", "redis",
      "aws", "docker", "kubernetes", "git", "ci/cd", "pytorch", "tensorflow", "opencv"
    ];
    const softKeywords = [
      "leadership", "mentoring", "communication", "agile", "scrum", "collaboration", "problem solving"
    ];

    technicalKeywords.forEach((skill) => {
      if (textLower.includes(skill)) sections.skills.technical.push(skill);
    });
    softKeywords.forEach((skill) => {
      if (textLower.includes(skill)) sections.skills.soft.push(skill);
    });

    const experienceHighlights = [];
    const projectHighlights = [];
    let currentSection = "summary";

    lines.forEach((line) => {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes("experience") || lowerLine.includes("work history") || lowerLine.includes("employment")) {
        currentSection = "experience";
      } else if (lowerLine.includes("project")) {
        currentSection = "projects";
      } else if (lowerLine.includes("education") || lowerLine.includes("academic")) {
        currentSection = "education";
      } else if (lowerLine.includes("certification") || lowerLine.includes("credentials")) {
        currentSection = "certifications";
      } else if (line.startsWith("-") || line.startsWith("•") || line.startsWith("*")) {
        const cleanBullet = line.replace(/^[-•*]\s*/, "");
        if (currentSection === "experience") experienceHighlights.push(cleanBullet);
        else if (currentSection === "projects") projectHighlights.push(cleanBullet);
      }
    });

    sections.candidateProfile = {
      fullName: name,
      email: emailMatch ? emailMatch[0] : "",
      phoneNumber: phoneMatch ? phoneMatch[0] : "",
      linkedin: linkedinMatch ? linkedinMatch[0] : "",
      github: githubMatch ? githubMatch[0] : "",
      summary: lines.slice(1, 4).join(" "),
    };

    sections.experience = experienceHighlights.length > 0 ? [{
      company: "Last Employer",
      position: "Software Engineer",
      startDate: "Jan 2022",
      endDate: "Present",
      durationInMonths: 24,
      highlights: experienceHighlights,
    }] : [];

    sections.projects = projectHighlights.length > 0 ? [{
      name: "Project Prototype",
      description: projectHighlights.join(" "),
      technologies: sections.skills.technical.slice(0, 3),
      githubLink: githubMatch ? `https://${githubMatch[0]}` : "",
    }] : [];

    sections.education = textLower.includes("university") || textLower.includes("college") ? [{
      institution: "University",
      degree: "Bachelor of Science",
      fieldOfStudy: "Computer Science",
      graduationYear: "2021",
    }] : [];

    sections.certifications = textLower.includes("certif") ? [{
      name: "AWS Certified Developer",
      provider: "Amazon Web Services",
    }] : [];

    sections.rawText = rawText;
    return sections;
  }
}

export default LocalResumeParserService;
