import { Resume } from "../models/Resume.js";
import { ResumeOptimization } from "../models/ResumeOptimization.js";

/**
 * Resume Data Access Repository
 * Encapsulates Mongoose database calls for Resumes.
 */
export class ResumeRepository {
  /**
   * Finds the latest active resume version for a user
   */
  async findLatestByUserId(userId) {
    return await Resume.findOne({ userId, isLatest: true });
  }

  /**
   * Returns the full resume collection for a user, sorted descending by version.
   */
  async findAllByUserId(userId) {
    return await Resume.find({ userId }).sort({ version: -1 });
  }

  /**
   * Returns complete upload history for a user, sorted descending by version
   */
  async findHistoryByUserId(userId) {
    return await this.findAllByUserId(userId);
  }

  /**
   * Find specific resume by its ID and owner ID
   */
  async findByIdAndUser(id, userId) {
    return await Resume.findOne({ _id: id, userId });
  }

  async findVersionsByParentId(parentId, userId) {
    const parent = await Resume.findOne({ _id: parentId, userId });
    if (!parent) return [];

    return await Resume.find({ userId, createdAt: { $lte: parent.createdAt } }).sort({ version: -1 });
  }

  async compareVersions(fromId, toId, userId) {
    const [from, to] = await Promise.all([
      Resume.findOne({ _id: fromId, userId }),
      Resume.findOne({ _id: toId, userId }),
    ]);

    if (!from || !to) return null;

    const fromSkills = [...(from.parsedProfile?.skills?.technical || []), ...(from.parsedProfile?.skills?.soft || [])];
    const toSkills = [...(to.parsedProfile?.skills?.technical || []), ...(to.parsedProfile?.skills?.soft || [])];

    const addedSkills = toSkills.filter((skill) => !fromSkills.includes(skill));
    const removedSkills = fromSkills.filter((skill) => !toSkills.includes(skill));

    const sectionDiffs = [];
    const sections = ["summary", "experience", "education", "skills", "projects"];
    sections.forEach((section) => {
      const fromValue = from.parsedProfile?.[section];
      const toValue = to.parsedProfile?.[section];
      if (JSON.stringify(fromValue) !== JSON.stringify(toValue)) {
        sectionDiffs.push({ section, changed: true });
      }
    });

    return {
      from: from._id.toString(),
      to: to._id.toString(),
      addedSkills,
      removedSkills,
      sectionDiffs,
    };
  }

  /**
   * Creates a new Resume record
   */
  async createResume(resumeData) {
    const resume = new Resume(resumeData);
    return await resume.save();
  }

  /**
   * Determines next version number for a user's resume uploads
   */
  async getNextVersionNumber(userId) {
    const latest = await Resume.findOne({ userId })
      .setOptions({ includeDeleted: true }) // Include soft-deleted files in version count
      .sort({ version: -1 });
    return latest ? latest.version + 1 : 1;
  }

  /**
   * Marks all existing resumes for a user as not latest
   */
  async markPreviousVersionsArchived(userId) {
    return await Resume.updateMany(
      { userId, isLatest: true },
      { isLatest: false }
    );
  }

  /**
   * Performs soft delete on a resume record
   */
  async softDelete(id, userId) {
    const resume = await Resume.findOne({ _id: id, userId });
    if (!resume) return null;

    resume.isDeleted = true;
    resume.deletedAt = new Date();
    resume.isLatest = false; // Cannot be active if deleted
    await resume.save();

    // If we deleted the latest active resume, make the next highest version the active one
    const remaining = await Resume.find({ userId }).sort({ version: -1 });
    if (remaining.length > 0) {
      remaining[0].isLatest = true;
      await remaining[0].save();
    }

    return resume;
  }

  /**
   * Restores a previously uploaded version as the active resume
   */
  async restoreVersion(id, userId) {
    // 1. Mark current latest as archived
    await this.markPreviousVersionsArchived(userId);

    // 2. Mark restored target version as latest
    const resume = await Resume.findOne({ _id: id, userId });
    if (!resume) return null;

    resume.isLatest = true;
    resume.status = "Completed"; // Mark active
    return await resume.save();
  }

  async save(resumeDocument) {
    return await resumeDocument.save();
  }

  async createOptimization(optimizationData) {
    const optimization = new ResumeOptimization(optimizationData);
    return await optimization.save();
  }

  async getOptimizationsByResumeId(resumeId, userId) {
    return await ResumeOptimization.find({ resumeId, userId }).sort({ createdAt: -1 });
  }

  async updateResumeText(id, userId, rawText) {
    const resume = await Resume.findOne({ _id: id, userId });
    if (!resume) return null;
    resume.rawText = rawText;
    return await resume.save();
  }
}

export default ResumeRepository;
