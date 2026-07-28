import { Download, FileJson, Printer, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/cards/GlassCard";
import { useToast } from "@/hooks/useToast";
import type { CareerRoadmapResult } from "@/types";

interface CareerExportSectionProps {
  result: CareerRoadmapResult;
}

/** Same export pattern as the ATS Intelligence page's `ExportSection` —
 * real JSON download + print now, "coming soon" toast for the options
 * that need a backend PDF/share endpoint that doesn't exist yet. */
export function CareerExportSection({ result }: CareerExportSectionProps) {
  const toast = useToast();

  function downloadJson(filename: string, data: unknown, successMessage: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded", successMessage);
  }

  function handleDownloadReport() {
    downloadJson(
      `career-roadmap-${result.targetRole.toLowerCase().replace(/\s+/g, "-")}.json`,
      result,
      "Your full career report was downloaded."
    );
  }

  function handleDownloadLearningPlan() {
    downloadJson(
      `learning-plan-${result.targetRole.toLowerCase().replace(/\s+/g, "-")}.json`,
      {
        targetRole: result.targetRole,
        roadmap: result.roadmap,
        certifications: result.certifications,
        learningResources: result.learningResources,
        projectRecommendations: result.projectRecommendations,
      },
      "Your learning plan was downloaded."
    );
  }

  function handlePrint() {
    window.print();
  }

  function handleShareProgress() {
    toast.info("Share Progress coming soon", "This export option isn't wired up to the backend yet.");
  }

  return (
    <GlassCard className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Export your roadmap</h3>
        <p className="mt-0.5 text-xs text-foreground-secondary">Save or share your career growth plan.</p>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <Button variant="outline" size="sm" onClick={handleDownloadReport}>
          <Download size={14} /> Career Report
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownloadLearningPlan}>
          <FileJson size={14} /> Learning Plan
        </Button>
        <Button variant="outline" size="sm" onClick={handleShareProgress}>
          <Share2 size={14} /> Share Progress
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer size={14} /> Print
        </Button>
      </div>
    </GlassCard>
  );
}
