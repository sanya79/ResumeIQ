import { useState } from "react";
import { Download, FileJson, Loader2, Printer, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/cards/GlassCard";
import { useToast } from "@/hooks/useToast";
import { downloadReportPdf, fetchReportPdfBlob } from "@/services/resume.api";
import type { Resume } from "@/types";

interface ExportSectionProps {
  resume: Resume;
}

export function ExportSection({ resume }: ExportSectionProps) {
  const toast = useToast();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  async function handleDownloadPdf() {
    if (!resume._id) {
      toast.error("Error", "Resume ID not found.");
      return;
    }

    try {
      setIsDownloadingPdf(true);
      toast.info("Generating PDF...", "Your professional ATS report PDF is being generated.");
      await downloadReportPdf(resume._id, resume.originalName || "resume");
      toast.success("PDF Downloaded!", "Your ATS report PDF has been downloaded successfully.");
    } catch (error: any) {
      console.error("PDF Download error:", error);
      const msg = error?.response?.data?.message || error?.message || "Could not generate or download the PDF report.";
      toast.error("Download Failed", msg);
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  function handleDownloadJson() {
    try {
      const dataToExport = resume.atsScorecard || resume;
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const sanitizedName = (resume.originalName || "resume").replace(/\.[^.]+$/, "").replace(/[^a-z0-9_-]+/gi, "_");
      link.href = url;
      link.download = `${sanitizedName}_ats_report.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("JSON Exported", "Your ATS scorecard JSON file was downloaded.");
    } catch (error) {
      toast.error("Export Failed", "Could not export JSON data.");
    }
  }

  async function handleShare() {
    if (!resume._id) {
      toast.error("Error", "Resume ID not found.");
      return;
    }

    setIsSharing(true);
    try {
      toast.info("Preparing PDF...", "Fetching report PDF to share...");
      const pdfBlob = await fetchReportPdfBlob(resume._id);
      const sanitizedName = (resume.originalName || "resume")
        .replace(/\.[^.]+$/, "")
        .replace(/[^a-z0-9_-]+/gi, "_");
      const fileName = `${sanitizedName}_ATS_Report.pdf`;
      const pdfFile = new File([pdfBlob], fileName, { type: "application/pdf" });

      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          title: "ResumeIQ ATS Evaluation Report",
          text: `Here is the ATS evaluation report PDF for ${resume.originalName || "the candidate resume"}. Score: ${resume.atsScorecard?.overallScore || 0}/100.`,
          files: [pdfFile],
        });
        toast.success("Shared!", "PDF report shared successfully.");
      } else if (navigator.share) {
        // Fallback for browsers supporting Web Share without file support
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        await navigator.share({
          title: "ResumeIQ ATS Evaluation Report",
          text: `Check out the ATS evaluation report. (PDF report downloaded).`,
          url: window.location.href,
        });
        toast.success("PDF Downloaded & Shared!", "PDF report downloaded and share window opened.");
      } else {
        // Desktop browser fallback
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        try {
          await navigator.clipboard.writeText(window.location.href);
        } catch (e) {
          /* ignore */
        }

        toast.success("PDF Downloaded!", "PDF report downloaded & share link copied to clipboard.");
      }
    } catch (error: any) {
      if (error?.name !== "AbortError") {
        console.error("PDF Share error:", error);
        toast.error("Sharing Failed", "Could not share the PDF report file.");
      }
    } finally {
      setIsSharing(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <GlassCard className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Export this analysis</h3>
        <p className="mt-0.5 text-xs text-foreground-secondary">Save or share your ATS scorecard.</p>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={isDownloadingPdf}>
          {isDownloadingPdf ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Download size={14} /> PDF Report
            </>
          )}
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownloadJson}>
          <FileJson size={14} /> JSON
        </Button>
        <Button variant="outline" size="sm" onClick={handleShare} disabled={isSharing}>
          <Share2 size={14} /> Share
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer size={14} /> Print
        </Button>
      </div>
    </GlassCard>
  );
}

