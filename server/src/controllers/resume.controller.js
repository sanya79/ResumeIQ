import { ResumeRepository } from "../repositories/resume.repository.js";
import { PipelineService } from "../services/pipeline.service.js";
import { PdfService } from "../services/pdf.service.js";
import { AtsScoringService } from "../ats/services/atsScoringService.js";
import { MockLLMOptimizerService } from "../services/llmOptimizer.service.js";
import { MockLLMChatService } from "../services/llmChat.service.js";
import { MockEmbeddingService } from "../services/embedding.service.js";
import { buildResumeKnowledgeGraph } from "../services/knowledgeGraph.service.js";
import { ChatMessage } from "../models/ChatMessage.js";
import { sendSuccess } from "../utils/response.js";
import { AppError } from "../utils/appError.js";

const resumeRepository = new ResumeRepository();
const pipelineService = new PipelineService();
const optimizerService = new MockLLMOptimizerService();
const chatService = new MockLLMChatService(new MockEmbeddingService());

/**
 * Controller mapping HTTP routes to Resume upload & version actions
 */
export class ResumeController {
  /**
   * Uploads and runs parsing-scoring pipeline
   */
  async uploadResume(req, res, next) {
    try {
      if (!req.file) {
        return next(new AppError("Please select a resume file (PDF or DOCX) to upload.", 400));
      }

      const { uploadSource } = req.body;
      const userId = req.user._id;

      // Delegate upload handling and calculations to pipeline service
      const resumeRecord = await pipelineService.processUpload(
        userId,
        req.file,
        uploadSource
      );

      return sendSuccess(
        res,
        "Resume uploaded and analyzed successfully.",
        { resume: resumeRecord },
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Loads the current active latest resume copy
   */
  async getLatestResume(req, res, next) {
    try {
      const latest = await resumeRepository.findLatestByUserId(req.user._id);
      if (!latest) {
        return sendSuccess(res, "No resumes uploaded yet.", null);
      }
      return sendSuccess(res, "Latest resume loaded.", { resume: latest });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Loads the full resume collection for the authenticated user.
   */
  async getResumeList(req, res, next) {
    try {
      const resumes = await resumeRepository.findAllByUserId(req.user._id);
      return sendSuccess(res, "Resumes loaded.", { resumes });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Loads full upload history and older versions list
   */
  async getResumeHistory(req, res, next) {
    try {
      const history = await resumeRepository.findHistoryByUserId(req.user._id);
      return sendSuccess(res, "Resume upload history loaded.", { history });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lists all versions for the given resume parent.
   */
  async getResumeVersions(req, res, next) {
    try {
      const versions = await resumeRepository.findVersionsByParentId(req.params.id, req.user._id);
      return sendSuccess(res, "Resume versions loaded.", { versions });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Compares two resume versions and returns added/removed skills + section diffs.
   */
  async compareResumeVersions(req, res, next) {
    try {
      const { from, to } = req.query;
      if (!from || !to) {
        return next(new AppError("Both from and to resume IDs are required.", 400));
      }

      const comparison = await resumeRepository.compareVersions(from, to, req.user._id);
      return sendSuccess(res, "Resume comparison loaded.", { comparison });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gets specific details and scorecard of a resume file
   */
  async getResumeDetails(req, res, next) {
    try {
      const resume = await resumeRepository.findByIdAndUser(req.params.id, req.user._id);
      if (!resume) {
        return next(new AppError("Requested resume not found or access unauthorized.", 404));
      }
      return sendSuccess(res, "Resume details loaded.", { resume });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Performs soft deletion on a file
   */
  async deleteResume(req, res, next) {
    try {
      const deleted = await resumeRepository.softDelete(req.params.id, req.user._id);
      if (!deleted) {
        return next(new AppError("Requested resume not found or access unauthorized.", 404));
      }
      return sendSuccess(res, "Resume deleted successfully.");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Restores an older version as the active candidate layout
   */
  async restoreResumeVersion(req, res, next) {
    try {
      const restored = await resumeRepository.restoreVersion(req.params.id, req.user._id);
      if (!restored) {
        return next(new AppError("Requested resume version not found or access unauthorized.", 404));
      }
      return sendSuccess(res, "Resume version successfully restored as active.", { resume: restored });
    } catch (error) {
      next(error);
    }
  }

  async optimizeResume(req, res, next) {
    try {
      const resume = await resumeRepository.findByIdAndUser(req.params.id, req.user._id);
      if (!resume) {
        return next(new AppError("Requested resume not found or access unauthorized.", 404));
      }

      const { targetRole = "Software Engineer", targetCompany = "" } = req.body;
      const optimization = await optimizerService.optimizeResume({
        resumeText: resume.rawText || resume.comparisonSummary || "",
        targetRole,
        targetCompany,
      });

      const savedOptimization = await resumeRepository.createOptimization({
        resumeId: resume._id,
        userId: req.user._id,
        targetRole,
        targetCompany,
        rewrittenSummary: optimization.rewrittenSummary,
        rewrittenBullets: optimization.rewrittenBullets,
        quantifiedImpactSuggestions: optimization.quantifiedImpactSuggestions,
        tailoringNotes: optimization.tailoringNotes,
      });

      return sendSuccess(res, "Resume optimization generated.", {
        optimization: {
          _id: savedOptimization._id,
          targetRole,
          targetCompany,
          rewrittenSummary: optimization.rewrittenSummary,
          rewrittenBullets: optimization.rewrittenBullets,
          quantifiedImpactSuggestions: optimization.quantifiedImpactSuggestions,
          tailoringNotes: optimization.tailoringNotes,
          createdAt: savedOptimization.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getOptimizations(req, res, next) {
    try {
      const optimizations = await resumeRepository.getOptimizationsByResumeId(req.params.id, req.user._id);
      return sendSuccess(res, "Resume optimizations loaded.", { optimizations });
    } catch (error) {
      next(error);
    }
  }

  async getKnowledgeGraph(req, res, next) {
    try {
      const resume = await resumeRepository.findByIdAndUser(req.params.id, req.user._id);
      if (!resume) {
        return next(new AppError("Requested resume not found or access unauthorized.", 404));
      }

      const graph = buildResumeKnowledgeGraph(resume.parsedProfile || {});
      return sendSuccess(res, "Resume knowledge graph loaded.", { graph });
    } catch (error) {
      next(error);
    }
  }

  async applyOptimization(req, res, next) {
    try {
      const resume = await resumeRepository.updateResumeText(req.params.id, req.user._id, req.body.rawText);
      if (!resume) {
        return next(new AppError("Requested resume not found or access unauthorized.", 404));
      }
      return sendSuccess(res, "Resume text updated.", { resume });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generates and downloads the ATS report PDF
   */
  async getChatHistory(req, res, next) {
    try {
      const resume = await resumeRepository.findByIdAndUser(req.params.id, req.user._id);
      if (!resume) {
        return next(new AppError("Requested resume not found or access unauthorized.", 404));
      }

      const messages = await ChatMessage.find({ resumeId: resume._id }).sort({ createdAt: 1 }).lean();
      return sendSuccess(res, "Resume chat history loaded.", { messages });
    } catch (error) {
      next(error);
    }
  }

  async chatWithResume(req, res, next) {
    try {
      const resume = await resumeRepository.findByIdAndUser(req.params.id, req.user._id);
      if (!resume) {
        return next(new AppError("Requested resume not found or access unauthorized.", 404));
      }

      const { message, conversationId } = req.body;
      if (!message || !message.trim()) {
        return next(new AppError("message is required.", 400));
      }

      const history = await ChatMessage.find({ resumeId: resume._id }).sort({ createdAt: 1 }).lean();
      const conversationHistory = history.filter((entry) => entry.role === "user" || entry.role === "assistant");
      const persistedUserMessage = await ChatMessage.create({ resumeId: resume._id, role: "user", content: message.trim() });

      const snippets = [];
      const textParts = [];
      if (resume.rawText) textParts.push({ title: "Resume content", text: resume.rawText });
      if (resume.comparisonSummary) textParts.push({ title: "Resume summary", text: resume.comparisonSummary });
      if (resume.atsScorecard?.top10Improvements?.length) {
        textParts.push({ title: "ATS improvements", text: resume.atsScorecard.top10Improvements.join("\n") });
      }
      if (resume.atsScorecard?.strengths?.length) {
        textParts.push({ title: "ATS strengths", text: resume.atsScorecard.strengths.map((item) => item.name).join("\n") });
      }

      for (const part of textParts) {
        const similarity = await chatService.embeddingService.similarity(message, part.text);
        if (similarity > 0.1) {
          snippets.push({ title: part.title, text: part.text.slice(0, 600) });
        }
      }

      if (snippets.length === 0) {
        snippets.push({ title: "Resume context", text: resume.rawText?.slice(0, 800) || "No resume content found." });
      }

      const fullResumeContext = {
        rawText: resume.rawText || "",
        parsedProfile: resume.parsedProfile || {},
        atsScorecard: resume.atsScorecard || {},
        comparisonSummary: resume.comparisonSummary || "",
        originalName: resume.originalName || "",
      };

      const response = await chatService.generateReply({
        message,
        contextSnippets: snippets,
        fullResumeContext,
        conversationHistory: conversationHistory.slice(-6),
      });

      const assistantMessage = await ChatMessage.create({ resumeId: resume._id, role: "assistant", content: response.answer });
      const sourceSnippets = snippets.map((snippet) => ({ title: snippet.title, text: snippet.text }));

      return sendSuccess(res, "Resume chat response generated.", {
        answer: assistantMessage.content,
        sourceSnippets,
        conversationId: conversationId || persistedUserMessage._id.toString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async downloadReportPdf(req, res, next) {
    try {
      const resume = await resumeRepository.findByIdAndUser(req.params.id, req.user._id);
      if (!resume) {
        return next(new AppError("Requested resume not found or access unauthorized.", 404));
      }

      let scorecard = resume.atsScorecard;
      if (!scorecard || !scorecard.overallScore) {
        const scoringService = new AtsScoringService();
        const analysis = await scoringService.scoreResumeText(resume.rawText || "", "");
        scorecard = {
          overallScore: analysis.overall,
          estimatedImprovedScore: Math.min(100, analysis.overall + 8),
          atsVersion: "ats-v1",
          strengths: (analysis.breakdown.formatting.reasons || [])
            .concat(analysis.breakdown.keywords.reasons || [])
            .slice(0, 4)
            .map((r) => (typeof r === "string" ? { name: r, message: r } : r)),
          weakAreas: (analysis.improvementSuggestions || [])
            .slice(0, 4)
            .map((s) => (typeof s === "string" ? { name: s, message: s } : s)),
          top10Improvements: analysis.improvementSuggestions || [],
          breakdown: [
            {
              id: "formatting",
              name: "Formatting",
              score: analysis.breakdown.formatting.score,
              maxScore: 100,
              reason: (analysis.breakdown.formatting.reasons || []).join("; ") || "Formatting structure evaluated.",
            },
            {
              id: "keywords",
              name: "Keywords",
              score: analysis.breakdown.keywords.score,
              maxScore: 100,
              reason: (analysis.breakdown.keywords.reasons || []).join("; ") || "Keyword relevance analyzed.",
            },
            {
              id: "sections",
              name: "Sections",
              score: analysis.breakdown.sections.score,
              maxScore: 100,
              reason: (analysis.breakdown.sections.reasons || []).join("; ") || "Section completeness checked.",
            },
            {
              id: "readability",
              name: "Readability",
              score: analysis.breakdown.readability.score,
              maxScore: 100,
              reason: (analysis.breakdown.readability.reasons || []).join("; ") || "Readability score calculated.",
            },
          ],
        };
      }

      const pdfService = new PdfService();
      pdfService.generateAtsReport(res, scorecard, resume.originalName || "resume");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generates an optimized resume PDF tailored to the latest ATS analysis.
   */
  async downloadOptimizedResumePdf(req, res, next) {
    try {
      const resume = await resumeRepository.findByIdAndUser(req.params.id, req.user._id);
      if (!resume) {
        return next(new AppError("Requested resume not found or access unauthorized.", 404));
      }

      const keywordItem = (resume.atsScorecard?.breakdown || []).find((item) => item.id === "keyword_relevance");
      const matchedKeywords = (keywordItem?.evidence || []).flatMap((entry) => {
        const terms = [...entry.matchAll(/'([^']+)'/g)].map((match) => match[1].trim()).filter(Boolean);
        return terms.map((term) => ({ term, priority: "Medium", reason: "Detected in your existing resume content." }));
      });

      const missingKeywords = (keywordItem?.suggestions || []).flatMap((entry) => {
        const terms = [...entry.matchAll(/'([^']+)'/g)].map((match) => match[1].trim()).filter(Boolean);
        return terms.map((term) => ({ term, priority: "Medium", reason: "Suggested by ATS analysis to strengthen your resume." }));
      });

      const pdfService = new PdfService();
      pdfService.generateOptimizedResume(
        res,
        resume,
        matchedKeywords,
        missingKeywords,
        req.query.jobTitle || "target role"
      );
    } catch (error) {
      next(error);
    }
  }
}

export default ResumeController;
