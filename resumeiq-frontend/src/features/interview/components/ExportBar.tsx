import { Download, Printer, Share2, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";
import type { PerformanceReport } from "@/types";

interface ExportBarProps {
  report: PerformanceReport;
}

/**
 * All four actions are genuinely functional against the real report
 * already in hand — no fake endpoints invented:
 *  - JSON download: real Blob of the report data.
 *  - "PDF Report": uses the browser's native print-to-PDF via window.print()
 *    on this same view, rather than standing up a separate PDF pipeline.
 *  - Print: same window.print().
 *  - Share: copies a short plain-text summary to the clipboard (no backend
 *    "share link" endpoint exists to generate a real shareable URL).
 */
export function ExportBar({ report }: ExportBarProps) {
  const toast = useToast();

  function downloadJson() {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview-report-${report.sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function shareSummary() {
    const summary = `My ResumeIQ interview report: ${Math.round(report.overallScore)}/100 overall, ${Math.round(
      report.interviewReadiness
    )}% interview-ready.`;
    navigator.clipboard?.writeText(summary);
    toast.info("Copied", "Summary copied to clipboard.");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="secondary" size="sm" onClick={() => window.print()}>
        <Download size={14} /> Download PDF Report
      </Button>
      <Button variant="secondary" size="sm" onClick={downloadJson}>
        <Save size={14} /> Download JSON
      </Button>
      <Button variant="secondary" size="sm" onClick={shareSummary}>
        <Share2 size={14} /> Share Analysis
      </Button>
      <Button variant="ghost" size="sm" onClick={() => window.print()}>
        <Printer size={14} /> Print
      </Button>
    </div>
  );
}
