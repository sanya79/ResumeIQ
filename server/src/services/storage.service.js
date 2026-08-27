import fs from "fs";
import path from "path";

/**
 * Storage abstraction for uploaded resumes.
 * The default implementation persists files to local disk for development and
 * can later be swapped for S3 / Cloud Storage without changing callers.
 */
export class StorageService {
  async saveFile(file, userId) {
    throw new Error("StorageService.saveFile must be implemented by a concrete storage provider.");
  }

  async deleteFile(filePath) {
    throw new Error("StorageService.deleteFile must be implemented by a concrete storage provider.");
  }

  getUploadDirectory() {
    throw new Error("StorageService.getUploadDirectory must be implemented by a concrete storage provider.");
  }

  buildFileName(originalName, userId) {
    throw new Error("StorageService.buildFileName must be implemented by a concrete storage provider.");
  }
}

export class LocalDiskStorageService extends StorageService {
  constructor(baseDir = path.join(process.cwd(), "uploads")) {
    super();
    this.baseDir = baseDir;
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  getUploadDirectory() {
    return this.baseDir;
  }

  buildFileName(originalName, userId) {
    const safeName = originalName
      .replace(/[^a-zA-Z0-9.\-_]/g, "_")
      .replace(/\.\.+/g, ".");
    const timestamp = Date.now();
    const ext = path.extname(safeName).toLowerCase();
    return `resume_${userId}_${timestamp}${ext}`;
  }

  async saveFile(file, userId) {
    return {
      storedName: file.filename || this.buildFileName(file.originalname, userId),
      storageUrl: file.path,
    };
  }

  async deleteFile(filePath) {
    if (!filePath) return;
    try {
      fs.unlinkSync(filePath);
    } catch {
      // Best-effort cleanup.
    }
  }
}

export default LocalDiskStorageService;
