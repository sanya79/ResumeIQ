export const MAX_RESUME_FILE_SIZE = 10 * 1024 * 1024; // 10MB — matches upload.middleware.js
export const ACCEPTED_RESUME_EXTENSIONS = [".pdf", ".docx"] as const;
export const ACCEPTED_RESUME_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export type ResumeFileErrorCode = "unsupported-type" | "too-large";

export interface ResumeFileValidationResult {
  valid: boolean;
  errorCode?: ResumeFileErrorCode;
  message?: string;
}

/** Mirrors the backend's fileFilter + size limit exactly, so the UI can
 * reject an invalid file instantly instead of round-tripping to the API
 * just to get the same rejection back. The server remains the source of
 * truth — this is a UX shortcut, not a security boundary. */
export function validateResumeFile(file: File): ResumeFileValidationResult {
  const ext = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
  const isExtAllowed = (ACCEPTED_RESUME_EXTENSIONS as readonly string[]).includes(ext);
  const isMimeAllowed = (ACCEPTED_RESUME_MIME_TYPES as readonly string[]).includes(file.type);

  if (!isExtAllowed || !isMimeAllowed) {
    return {
      valid: false,
      errorCode: "unsupported-type",
      message: "Unsupported file type. Only PDF and DOCX documents are allowed.",
    };
  }

  if (file.size > MAX_RESUME_FILE_SIZE) {
    return {
      valid: false,
      errorCode: "too-large",
      message: "Uploaded file size exceeds the allowed limit (10MB).",
    };
  }

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
