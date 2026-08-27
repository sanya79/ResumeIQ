import multer from "multer";
import path from "path";
import fs from "fs";
import { AppError } from "../utils/appError.js";

// Ensure uploads folder exists in workspace root
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Configure Multer disk storage properties
 * Generates secure, sanitized, and unique file naming structures.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename to remove dangerous path traversal inputs
    const originalCleaned = file.originalname
      .replace(/[^a-zA-Z0-9.\-_]/g, "_") // Replace special characters
      .replace(/\.\.+/g, "."); // Block double dot directory jumps
    
    // Structure: ownerId_timestamp_v[Version].ext
    const ownerId = req.user ? req.user._id : "anonymous";
    const timestamp = Date.now();
    const ext = path.extname(originalCleaned).toLowerCase();
    
    cb(null, `resume_${ownerId}_${timestamp}${ext}`);
  }
});

/**
 * File extension and MIME type validation filter
 */
const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".pdf", ".docx"];
  const allowedMimeTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword" // older doc format
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  const isExtAllowed = allowedExtensions.includes(ext);
  const isMimeAllowed = allowedMimeTypes.includes(mime);

  if (isExtAllowed && isMimeAllowed) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Unsupported file type. Only PDF and DOCX documents are allowed. Received: ${ext} (${mime})`,
        400
      ),
      false
    );
  }
};

// Set up Multer instances
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limits
    files: 1 // Upload 1 file per call
  }
});

export default upload;
