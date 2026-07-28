import { useState, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/hooks/useToast";
import { RefreshCcw, Sparkles, UploadCloud } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { GradientBackground } from "@/components/animations/GradientBackground";
import { ParticleField } from "@/components/animations/ParticleField";
import { FadeIn } from "@/components/animations/FadeIn";
import { SlideUp } from "@/components/animations/SlideUp";
import { GlassCard } from "@/components/cards/GlassCard";
import { ATSScoreCard } from "@/components/cards/ATSScoreCard";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useLatestResume, useUploadResume } from "@/features/resume/hooks";
import { useAnalysisPipeline } from "@/features/resume/useAnalysisPipeline";
import { Dropzone } from "@/features/resume/components/Dropzone";
import { UploadProgressTimeline } from "@/features/resume/components/UploadProgressTimeline";
import { ResumeTextPreview } from "@/features/resume/components/ResumeTextPreview";
import { ResumeMetaCard } from "@/features/resume/components/ResumeMetaCard";
import { StrengthsWeaknessesPanel } from "@/features/resume/components/StrengthsWeaknessesPanel";
import { SuggestionsList } from "@/features/resume/components/SuggestionsList";
import { AnalysisCategoryCard } from "@/features/resume/components/AnalysisCategoryCard";
import { StructuredProfileComingSoon } from "@/features/resume/components/StructuredProfileComingSoon";
import { downloadOptimizedResumePdf } from "@/services/resume.api";

// Recharts is a heavy dependency (~250KB gzipped) — code-split so it only
// loads once analysis results actually render, same pattern as the
// dashboard's PerformanceChartsSection, instead of bloating this route's
// main chunk (it isn't itself route-lazy).
const RadarScoreChart = lazy(() =>
  import("@/features/resume/components/RadarScoreChart").then((m) => ({ default: m.RadarScoreChart }))
);
const CategoryComparisonChart = lazy(() =>
  import("@/features/resume/components/CategoryComparisonChart").then((m) => ({ default: m.CategoryComparisonChart }))
);

/** Distinguishes the real error shapes the backend can return for an
 * upload — unsupported type / too large (both 400 with specific messages,
 * see upload.middleware.js) vs. a network failure vs. an unexpected 5xx —
 * so the UI can show the right illustrated error rather than one generic message. */
function describeUploadError(error: unknown): { title: string; description: string } {
  const withResponse = error as { response?: { status?: number; data?: { message?: string } }; request?: unknown };
  const message = withResponse?.response?.data?.message;

  if (message?.toLowerCase().includes("unsupported file type")) {
    return { title: "Unsupported file", description: message };
  }
  if (message?.toLowerCase().includes("exceeds the allowed limit")) {
    return { title: "File too large", description: message };
  }
  if (withResponse?.response?.status && withResponse.response.status >= 500) {
    return { title: "Server error", description: message ?? "The server ran into a problem analyzing this resume. Please try again shortly." };
  }
  if (!withResponse?.response && withResponse?.request) {
    return { title: "Upload failed", description: "Couldn't reach the server. Check your connection and try again." };
  }
  return { title: "Upload failed", description: message ?? "Something went wrong uploading this resume. Please try again." };
}

export function ResumeWorkspacePage() {
  const { data: latestResume, isLoading, isError, refetch } = useLatestResume();
  const uploadMutation = useUploadResume();
  const toast = useToast();
  const { statuses } = useAnalysisPipeline(uploadMutation.isPending);
  const [showUploadFlow, setShowUploadFlow] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const resume = uploadMutation.data ?? latestResume;
  const isShowingAnalysis = resume && !showUploadFlow && !uploadMutation.isPending;

  function handleFileAccepted(file: File) {
    setClientError(null);
    uploadMutation.reset();
    uploadMutation.mutate({ file, uploadSource: "Web Dashboard" }, { onSuccess: () => setShowUploadFlow(false) });
  }

  async function handleDownloadImprovedResume() {
    if (!resume?._id) return;
    try {
      await downloadOptimizedResumePdf(resume._id, resume.atsScorecard?.atsVersion ? "target role" : undefined);
      toast.success("Improved resume ready", "Your optimized PDF download has started.");
    } catch {
      toast.error("Download failed", "The improved resume PDF couldn't be generated right now.");
    }
  }

  return (
    <PageContainer className="relative overflow-hidden">
      <GradientBackground className="opacity-50" />
      <ParticleField count={16} className="opacity-60" />

      <div className="container-page relative z-10 flex flex-col gap-8 py-10">
        {isLoading && (
          <div className="flex flex-col gap-6">
            <Skeleton className="mx-auto h-10 w-72 rounded-xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
        )}

        {isError && !isLoading && (
          <ErrorState
            title="Couldn't load your resume"
            description="Something went wrong reaching the server."
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && (uploadMutation.isPending || !resume || showUploadFlow) && (
          <FadeIn className="mx-auto flex w-full max-w-2xl flex-col gap-8">
            <GlassCard glow className="flex flex-col items-center gap-2 text-center">
              <span className="inline-flex rounded-2xl bg-gradient-primary p-3 text-white shadow-glow">
                <UploadCloud size={22} />
              </span>
              <h1 className="mt-2 text-fluid-2xl font-bold tracking-tight">Upload Your Resume</h1>
              <p className="max-w-md text-sm text-foreground-secondary">
                Upload a PDF or DOCX and let AI analyze your resume in seconds.
              </p>
            </GlassCard>

            {!uploadMutation.isPending && (
              <Dropzone onFileAccepted={handleFileAccepted} onFileRejected={setClientError} />
            )}

            {clientError && (
              <ErrorState title="Can't upload this file" description={clientError} onRetry={() => setClientError(null)} />
            )}

            {uploadMutation.isPending && <UploadProgressTimeline statuses={statuses} />}

            {uploadMutation.isError && !uploadMutation.isPending && (
              <ErrorState {...describeUploadError(uploadMutation.error)} onRetry={() => uploadMutation.reset()} />
            )}
          </FadeIn>
        )}

        <AnimatePresence>
          {isShowingAnalysis && resume && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-8"
            >
              <SlideUp className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-accent-purple" />
                  <h1 className="text-fluid-xl font-bold tracking-tight">AI Resume Analysis</h1>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resume?.atsScorecard && (
                    <Button variant="outline" size="sm" onClick={handleDownloadImprovedResume}>
                      <Sparkles size={14} /> Download improved resume PDF
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" onClick={() => setShowUploadFlow(true)}>
                    <RefreshCcw size={14} /> Upload new version
                  </Button>
                </div>
              </SlideUp>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
                <div className="min-h-[520px]">
                  <ResumeTextPreview fileName={resume.originalName} rawText={resume.rawText} />
                </div>
                <div className="flex flex-col gap-5">
                  <ResumeMetaCard resume={resume} />
                  {resume.atsScorecard && <ATSScoreCard result={resume.atsScorecard} />}
                </div>
              </div>

              {resume.atsScorecard && (
                <>
                  <StrengthsWeaknessesPanel
                    strengths={resume.atsScorecard.strengths}
                    weakAreas={resume.atsScorecard.weakAreas}
                  />

                  <SuggestionsList suggestions={resume.atsScorecard.top10Improvements} />

                  <div>
                    <h2 className="mb-4 text-fluid-lg font-semibold">Analysis Breakdown</h2>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {resume.atsScorecard.breakdown.map((item) => (
                        <AnalysisCategoryCard key={item.id} item={item} />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <Suspense fallback={<Skeleton className="h-72 w-full rounded-2xl" />}>
                      <RadarScoreChart data={resume.atsScorecard.visualizationData.radarChartData} />
                    </Suspense>
                    <Suspense fallback={<Skeleton className="h-72 w-full rounded-2xl" />}>
                      <CategoryComparisonChart data={resume.atsScorecard.visualizationData.categoryComparison} />
                    </Suspense>
                  </div>
                </>
              )}

              {resume.status === "Failed" && (
                <ErrorState
                  title="Analysis failed"
                  description="This resume couldn't be fully analyzed. Try re-uploading it."
                  onRetry={() => setShowUploadFlow(true)}
                />
              )}

              <StructuredProfileComingSoon />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageContainer>
  );
}
