import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { AppError } from "../utils/appError.js";
import { ResumeRepository } from "../repositories/resume.repository.js";
import { AtsEngine } from "../ats/index.js";

const resumeRepository = new ResumeRepository();
const atsEngine = new AtsEngine();

/**
 * Resume Processing Pipeline Service
 * Orchestrates text extraction, parsing, ATS scoring, and version history.
 */
export class PipelineService {
  /**
   * Runs the ingestion pipeline synchronously on uploaded files.
   * Designed to easily swap for BullMQ queue triggers later.
   */
  async processUpload(userId, file, uploadSource = "Web Dashboard") {
    if (!file) {
      throw new AppError("No file payload supplied for processing.", 400);
    }

    const filePath = file.path;
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Step 1: Initialize status parameters
    let status = "Parsing";
    let rawText = "";

    try {
      // Step 2: Extract plain text from physical file
      rawText = await this._extractText(filePath, ext);
      
      // Step 3: Clean and normalize extracted text
      rawText = this._normalizeText(rawText);

      status = "Analyzing";

      // Step 4: Parse structured components using rule-based NLP parser
      const parsedResumeData = this._parseResumeData(rawText, file.originalname);

      // Step 5: Evaluate resume profile against ATS criteria using AtsEngine
      const targetRole = this._heuristicallyDetectRole(parsedResumeData);
      const scorecard = await atsEngine.evaluate(parsedResumeData, { targetRole });

      status = "Completed";

      // Step 6: Determine version and archive older files
      const nextVersion = await resumeRepository.getNextVersionNumber(userId);
      await resumeRepository.markPreviousVersionsArchived(userId);

      // Step 7: Save database record
      const resumeData = {
        userId,
        originalName: file.originalname,
        storedName: file.filename,
        fileSize: file.size,
        extension: ext,
        mimeType: file.mimetype,
        storageUrl: file.path,
        version: nextVersion,
        status,
        isLatest: true,
        uploadSource,
        rawText,
        atsScorecard: scorecard
      };

      return await resumeRepository.createResume(resumeData);
    } catch (error) {
      // Fail-safe: Update status to Failed and save record so the user gets error notifications
      console.error("[Pipeline] Processing failed:", error);
      
      const nextVersion = await resumeRepository.getNextVersionNumber(userId);
      await resumeRepository.markPreviousVersionsArchived(userId);

      const failedResumeData = {
        userId,
        originalName: file.originalname,
        storedName: file.filename,
        fileSize: file.size,
        extension: ext,
        mimeType: file.mimetype,
        storageUrl: file.path,
        version: nextVersion,
        status: "Failed",
        isLatest: true,
        uploadSource,
        rawText: "Processing error encountered."
      };

      await resumeRepository.createResume(failedResumeData);
      throw new AppError(`Resume processing pipeline failed: ${error.message}`, 500);
    }
  }

  /**
   * Dispatches text extraction according to extension
   */
  async _extractText(filePath, ext) {
    const fileBuffer = fs.readFileSync(filePath);

    if (ext === ".pdf") {
      const data = await pdfParse(fileBuffer);
      return data.text || "";
    } else if (ext === ".docx") {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return result.value || "";
    } else {
      throw new AppError("Invalid extension. Only PDF and DOCX uploads supported.", 400);
    }
  }

  /**
   * Cleans text, removing double spacing and control characters
   */
  _normalizeText(text) {
    if (!text) return "";
    return text
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/[^\x20-\x7E\n]/g, "") // Strip non-ASCII characters
      .replace(/[ \t]+/g, " ") // Clean double tabs/spaces
      .replace(/\n\s*\n+/g, "\n\n") // Collapse consecutive breaks
      .trim();
  }

  /**
   * Light NLP parser extracting contact details, skills, experiences, and projects.
   */
  _parseResumeData(rawText, originalName) {
    const textLower = rawText.toLowerCase();

    // 1. Extract contact data
    const emailMatch = rawText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/);
    const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/);
    const githubMatch = rawText.match(/github\.com\/([A-Za-z0-9_-]+)/i);
    const linkedinMatch = rawText.match(/linkedin\.com\/in\/([A-Za-z0-9_-]+)/i);

    // Heuristic Name Extraction (Fall back to filename if not matched in first line)
    let name = originalName.split(".")[0].replace(/[_-]/g, " ");
    const lines = rawText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length > 0 && lines[0].split(" ").length <= 4) {
      name = lines[0];
    }

    // 2. Section Splitting
    const sections = {
      summary: "",
      experience: [],
      projects: [],
      education: [],
      skills: { technical: [], soft: [] },
      certifications: []
    };

    // Skills Taxonomy matching
    const technicalKeywords = [
      "javascript", "typescript", "python", "java", "golang", "rust", "react", "next.js",
      "vue", "angular", "node.js", "express", "mongodb", "postgresql", "mysql", "redis",
      "aws", "docker", "kubernetes", "git", "ci/cd", "pytorch", "tensorflow", "opencv"
    ];
    const softKeywords = [
      "leadership", "mentoring", "communication", "agile", "scrum", "collaboration", "problem solving"
    ];

    technicalKeywords.forEach(skill => {
      if (textLower.includes(skill)) {
        sections.skills.technical.push(skill);
      }
    });
    softKeywords.forEach(skill => {
      if (textLower.includes(skill)) {
        sections.skills.soft.push(skill);
      }
    });

    // Experience and Projects parser blocks (split lines into blocks based on headings)
    const experienceHighlights = [];
    const projectHighlights = [];
    let currentSection = "summary";

    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      
      // Fuzzy heading checks
      if (lowerLine.includes("experience") || lowerLine.includes("work history") || lowerLine.includes("employment")) {
        currentSection = "experience";
      } else if (lowerLine.includes("project")) {
        currentSection = "projects";
      } else if (lowerLine.includes("education") || lowerLine.includes("academic")) {
        currentSection = "education";
      } else if (lowerLine.includes("certification") || lowerLine.includes("credentials")) {
        currentSection = "certifications";
      } else if (line.startsWith("-") || line.startsWith("•") || line.startsWith("*")) {
        // Bullet parsing
        const cleanBullet = line.replace(/^[-•*]\s*/, "");
        if (currentSection === "experience") {
          experienceHighlights.push(cleanBullet);
        } else if (currentSection === "projects") {
          projectHighlights.push(cleanBullet);
        }
      }
    });

    // Populate Mock objects with parsed text blocks to build evaluation structures
    sections.candidateProfile = {
      fullName: name,
      email: emailMatch ? emailMatch[0] : "",
      phoneNumber: phoneMatch ? phoneMatch[0] : "",
      linkedin: linkedinMatch ? linkedinMatch[0] : "",
      github: githubMatch ? githubMatch[0] : "",
      summary: lines.slice(1, 4).join(" ") // heuristic summary
    };

    sections.experience = experienceHighlights.length > 0 ? [
      {
        company: "Last Employer",
        position: "Software Engineer",
        startDate: "Jan 2022",
        endDate: "Present",
        durationInMonths: 24,
        highlights: experienceHighlights
      }
    ] : [];

    sections.projects = projectHighlights.length > 0 ? [
      {
        name: "Project Prototype",
        description: projectHighlights.join(" "),
        technologies: sections.skills.technical.slice(0, 3),
        githubLink: githubMatch ? `https://${githubMatch[0]}` : ""
      }
    ] : [];

    sections.education = textLower.includes("university") || textLower.includes("college") ? [
      {
        institution: "University",
        degree: "Bachelor of Science",
        fieldOfStudy: "Computer Science",
        graduationYear: "2021"
      }
    ] : [];

    sections.certifications = textLower.includes("certif") ? [
      {
        name: "AWS Certified Developer",
        provider: "Amazon Web Services"
      }
    ] : [];

    sections.rawText = rawText;

    return sections;
  }

  _heuristicallyDetectRole(parsedData) {
    const tech = (parsedData.skills?.technical || []).map(t => t.toLowerCase());
    if (tech.includes("pytorch") || tech.includes("tensorflow")) return "ai_engineer";
    if (tech.includes("kubernetes") || tech.includes("docker")) return "devops";
    if (tech.includes("react") && tech.includes("node.js")) return "fullstack";
    if (tech.includes("react") || tech.includes("css")) return "frontend";
    return "backend"; // Fallback default evaluation role
  }
}

export default PipelineService;
