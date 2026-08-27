import path from "path";
import { AppError } from "../utils/appError.js";
import { ResumeRepository } from "../repositories/resume.repository.js";
import { AtsEngine } from "../ats/index.js";
import { LocalDiskStorageService } from "./storage.service.js";
import { LocalResumeParserService } from "./resumeParser.service.js";

const resumeRepository = new ResumeRepository();
const atsEngine = new AtsEngine();
const storageService = new LocalDiskStorageService();
const parserService = new LocalResumeParserService();

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
    const { storedName, storageUrl } = await storageService.saveFile(file, userId);
    
    // Step 1: Initialize status parameters
    let status = "Parsing";
    let rawText = "";

    try {
      // Step 2: Extract plain text from physical file
      rawText = await parserService.extractText(filePath, file.originalname);
      
      // Step 3: Clean and normalize extracted text
      rawText = this._normalizeText(rawText);

      status = "Analyzing";

      // Step 4: Parse structured components using rule-based NLP parser
      const parsedResumeData = parserService.parse(rawText, file.originalname);
      const comparisonSummary = this._buildComparisonSummary(parsedResumeData);

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
        parsedProfile: parsedResumeData,
        comparisonSummary,
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

  _buildComparisonSummary(parsedData) {
    const profile = parsedData.candidateProfile || {};
    const skills = [...(parsedData.skills?.technical || []), ...(parsedData.skills?.soft || [])];
    const summaryParts = [];

    if (profile.fullName) summaryParts.push(`Candidate: ${profile.fullName}`);
    if (profile.email) summaryParts.push(`Email: ${profile.email}`);
    if (skills.length) summaryParts.push(`Skills: ${skills.slice(0, 6).join(", ")}`);
    if (parsedData.experience?.length) summaryParts.push(`Experience entries: ${parsedData.experience.length}`);

    return summaryParts.join(" • ");
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
