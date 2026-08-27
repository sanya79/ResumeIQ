import { useCallback, useRef, useState, type DragEvent } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileWarning } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import {
  ACCEPTED_RESUME_EXTENSIONS,
  MAX_RESUME_FILE_SIZE,
  validateResumeFile,
  formatFileSize,
} from "../validation";

interface DropzoneProps {
  onFileAccepted: (file: File) => void;
  onFileRejected: (message: string) => void;
  disabled?: boolean;
}

/** The signature upload surface — drag & drop or browse, with instant
 * client-side validation against the same rules the backend enforces. */
export function Dropzone({ onFileAccepted, onFileRejected, disabled }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      const result = validateResumeFile(file);
      if (!result.valid) {
        onFileRejected(result.message ?? "This file can't be uploaded.");
        return;
      }
      onFileAccepted(file);
    },
    [onFileAccepted, onFileRejected]
  );

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-disabled={disabled}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled) inputRef.current?.click();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "group relative flex cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl border-2 border-dashed px-6 py-16 text-center transition-colors",
        isDragging ? "border-accent-purple bg-accent-purple/5" : "border-surface-border hover:border-accent-purple/40",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      {/* Animated dashed-border glow ring, purely decorative */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl"
        animate={{ opacity: isDragging ? 1 : 0 }}
        style={{ boxShadow: "0 0 60px rgba(139,92,246,0.25)" }}
      />

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="inline-flex rounded-2xl bg-gradient-primary p-4 text-white shadow-glow"
      >
        <UploadCloud size={30} />
      </motion.div>

      <div>
        <p className="text-fluid-base font-semibold text-foreground">
          {isDragging ? "Drop your resume here" : "Drag & drop your resume"}
        </p>
        <p className="mt-1 text-sm text-foreground-secondary">or click to browse from your device</p>
      </div>

      <Button
        variant="secondary"
        size="md"
        onClick={(e) => {
          e.stopPropagation();
          inputRef.current?.click();
        }}
      >
        Browse Files
      </Button>

      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-foreground-secondary">
        <span>Accepted: {ACCEPTED_RESUME_EXTENSIONS.join(", ").toUpperCase()}</span>
        <span aria-hidden>·</span>
        <span className="inline-flex items-center gap-1">
          <FileWarning size={12} /> Max {formatFileSize(MAX_RESUME_FILE_SIZE)}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_RESUME_EXTENSIONS.join(",")}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
