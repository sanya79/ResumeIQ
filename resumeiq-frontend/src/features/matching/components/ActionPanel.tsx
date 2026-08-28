import { Wand2, FileStack, Download, BookmarkCheck, RotateCcw, BookmarkPlus } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";
import { downloadGeneratedResumePdf, downloadOptimizedResumePdf } from "@/services/matching.api";
import { downloadReportPdf } from "@/services/resume.api";
import { useSaveMatchComparison } from "../hooks";
import type { MatchResult } from "@/types";

interface ActionPanelProps {
  match: MatchResult;
  onAnalyzeAnother: () => void;
}

export function ActionPanel({ match, onAnalyzeAnother }: ActionPanelProps) {
  const toast = useToast();
  const saveMutation = useSaveMatchComparison();

  function handleSave() {
    saveMutation.mutate(match.id, {
      onSuccess: () => toast.success("Comparison saved", "You can find it in your match history."),
      onError: () => toast.error("Couldn't save", "Something went wrong saving this comparison."),
    });
  }

  async function handleOptimizeResume() {
    try {
      await downloadOptimizedResumePdf(match.id);
      toast.success("Optimizing Resume", "Downloaded your optimized resume PDF.");
    } catch {
      toast.error("Download failed", "The optimized resume PDF couldn't be generated right now.");
    }
  }

  async function handleGenerateResume() {
    try {
      await downloadGeneratedResumePdf(match.id);
      toast.success("Tailoring Resume", "Downloaded your tailored resume PDF based on the job description.");
    } catch {
      toast.error("Download failed", "The tailored resume PDF couldn't be generated right now.");
    }
  }

  async function handleExportReport() {
    try {
      if (match.resumeId) {
        toast.info("Generating Report PDF...", "Downloading your professional evaluation report PDF.");
        await downloadReportPdf(match.resumeId, match.jobTitle || "Job_Match_Report");
        toast.success("PDF Report Exported", "Your match report PDF was downloaded successfully.");
        return;
      }
    } catch {
      /* fallback to JSON export below */
    }

    const blob = new Blob([JSON.stringify(match, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(match.jobTitle || "job-match").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-report.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported", "Your match report was downloaded.");
  }

  const isSaved = match.isSaved || saveMutation.isSuccess;

  return (
    <GlassCard className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Next steps</h3>
        <p className="mt-0.5 text-xs text-foreground-secondary">Act on this match — optimize, export, or compare another role.</p>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <Button variant="gradient" size="sm" onClick={handleOptimizeResume}>
          <Wand2 size={14} /> Optimize Resume
        </Button>
        <Button variant="outline" size="sm" onClick={handleGenerateResume}>
          <FileStack size={14} /> Generate New Resume
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportReport}>
          <Download size={14} /> Export Report
        </Button>
        <Button variant={isSaved ? "secondary" : "outline"} size="sm" onClick={handleSave} disabled={isSaved || saveMutation.isPending}>
          {isSaved ? <BookmarkCheck size={14} /> : <BookmarkPlus size={14} />}
          {isSaved ? "Saved" : saveMutation.isPending ? "Saving…" : "Save Comparison"}
        </Button>
        <Button variant="ghost" size="sm" onClick={onAnalyzeAnother}>
          <RotateCcw size={14} /> Analyze Another Job
        </Button>
      </div>
    </GlassCard>
  );
}
