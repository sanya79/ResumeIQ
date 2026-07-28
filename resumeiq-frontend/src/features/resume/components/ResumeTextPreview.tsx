import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Download, ScanLine } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { Tooltip } from "@/components/ui/Tooltip";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/utils/cn";

interface ResumeTextPreviewProps {
  fileName: string;
  rawText?: string;
}

const MIN_SCALE = 0.8;
const MAX_SCALE = 1.6;

/**
 * ⚠️ The backend doesn't expose a route to serve the original uploaded
 * PDF/DOCX yet — only its extracted plain text is stored and returned
 * (Resume.rawText). This renders that real text in a reading pane rather
 * than faking a PDF preview. Toolbar actions are all genuinely functional:
 * zoom scales the reading font size, download saves the extracted text,
 * and fullscreen uses the real Fullscreen API.
 */
export function ResumeTextPreview({ fileName, rawText }: ResumeTextPreviewProps) {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  function zoomIn() {
    setScale((s) => Math.min(MAX_SCALE, +(s + 0.1).toFixed(2)));
  }
  function zoomOut() {
    setScale((s) => Math.max(MIN_SCALE, +(s - 0.1).toFixed(2)));
  }
  function fitWidth() {
    setScale(1);
  }

  async function toggleFullscreen() {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }

  function downloadExtractedText() {
    if (!rawText) return;
    const blob = new Blob([rawText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName.replace(/\.[^/.]+$/, "")}_extracted.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <GlassCard className="flex h-full flex-col gap-0 p-0" glow>
      <div className="flex items-center justify-between gap-2 border-b border-surface-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <ScanLine size={15} className="shrink-0 text-accent-cyan" />
          <span className="truncate text-sm font-medium text-foreground">{fileName}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Tooltip content="Zoom out">
            <button
              type="button"
              aria-label="Zoom out"
              onClick={zoomOut}
              className="rounded-lg p-2 text-foreground-secondary transition-colors hover:bg-white/[0.06] hover:text-foreground"
            >
              <ZoomOut size={15} />
            </button>
          </Tooltip>
          <Tooltip content="Fit width">
            <button
              type="button"
              aria-label="Fit width"
              onClick={fitWidth}
              className="rounded-lg px-2 py-1.5 text-xs font-medium text-foreground-secondary transition-colors hover:bg-white/[0.06] hover:text-foreground"
            >
              {Math.round(scale * 100)}%
            </button>
          </Tooltip>
          <Tooltip content="Zoom in">
            <button
              type="button"
              aria-label="Zoom in"
              onClick={zoomIn}
              className="rounded-lg p-2 text-foreground-secondary transition-colors hover:bg-white/[0.06] hover:text-foreground"
            >
              <ZoomIn size={15} />
            </button>
          </Tooltip>
          <Tooltip content="Download extracted text">
            <button
              type="button"
              aria-label="Download extracted text"
              onClick={downloadExtractedText}
              disabled={!rawText}
              className="rounded-lg p-2 text-foreground-secondary transition-colors hover:bg-white/[0.06] hover:text-foreground disabled:opacity-40"
            >
              <Download size={15} />
            </button>
          </Tooltip>
          <Tooltip content={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
            <button
              type="button"
              aria-label="Toggle fullscreen"
              onClick={toggleFullscreen}
              className="rounded-lg p-2 text-foreground-secondary transition-colors hover:bg-white/[0.06] hover:text-foreground"
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </Tooltip>
        </div>
      </div>

      <div
        ref={containerRef}
        className={cn("flex-1 overflow-y-auto bg-background-secondary px-6 py-6", isFullscreen && "bg-background")}
      >
        {rawText ? (
          <motion.pre
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ fontSize: `${0.85 * scale}rem` }}
            className="whitespace-pre-wrap break-words font-sans leading-relaxed text-foreground-secondary"
          >
            {rawText}
          </motion.pre>
        ) : (
          <EmptyState
            title="No extracted text available"
            description="This resume hasn't produced readable text yet — try re-uploading it."
          />
        )}
      </div>
    </GlassCard>
  );
}
