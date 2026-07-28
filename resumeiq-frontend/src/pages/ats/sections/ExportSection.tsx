import { Download, FileJson, Printer, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/cards/GlassCard";
import { useToast } from "@/hooks/useToast";
import type { Resume } from "@/types";

interface ExportSectionProps {
  resume: Resume;
}

export function ExportSection({ resume }: ExportSectionProps) {
  const toast = useToast();

  function handleDownloadPdf() {
    window.open(`/api/v1/resumes/${resume._id}/report-pdf`, "_blank");
    toast.success("Generating PDF", "Your ATS report PDF is being generated.");
  }

  function handleDownloadJson() {
    const blob = new Blob([JSON.stringify(resume.atsScorecard, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${resume.originalName.replace(/\.[^.]+$/, "")}-ats-report.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("JSON exported", "Your ATS scorecard was downloaded.");
  }

  function handlePrint() {
    window.print();
  }

  function handleComingSoon(label: string) {
    toast.info(`${label} coming soon`, "This export option isn't wired up to the backend yet.");
  }

  return (
    <GlassCard className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Export this analysis</h3>
        <p className="mt-0.5 text-xs text-foreground-secondary">Save or share your ATS scorecard.</p>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
          <Download size={14} /> PDF Report
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownloadJson}>
          <FileJson size={14} /> JSON
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleComingSoon("Share link")}>
          <Share2 size={14} /> Share
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer size={14} /> Print
        </Button>
      </div>
    </GlassCard>
  );
}
