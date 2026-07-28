import { lazy, Suspense, useMemo } from "react";
import { useParams } from "react-router-dom";
import { FileSearch } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { GradientBackground } from "@/components/animations/GradientBackground";
import { ParticleField } from "@/components/animations/ParticleField";
import { FadeIn } from "@/components/animations/FadeIn";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SuggestionsList } from "@/features/resume/components/SuggestionsList";
import { AnalysisCategoryCard } from "@/features/resume/components/AnalysisCategoryCard";
import { useLatestResume, useResumeDetails, useResumeHistory } from "@/features/resume/hooks";
import { buildScoreHistory, getComparisonPair } from "./data";
import { ScoreHeroSection } from "./sections/ScoreHeroSection";
import { KeywordAnalysisSection } from "./sections/KeywordAnalysisSection";
import { SectionAnalysisSection } from "./sections/SectionAnalysisSection";
import { AtsProblemsSection } from "./sections/AtsProblemsSection";
import { ResumeHeatmapSection } from "./sections/ResumeHeatmapSection";
import { ExportSection } from "./sections/ExportSection";

// Recharts-backed sections are code-split — same pattern used by the
// Resume Workspace page and Dashboard — so this route's main chunk stays
// lean and the chart library only loads once there's data to chart.
const RadarScoreChart = lazy(() =>
  import("@/features/resume/components/RadarScoreChart").then((m) => ({ default: m.RadarScoreChart }))
);
const CategoryComparisonChart = lazy(() =>
  import("@/features/resume/components/CategoryComparisonChart").then((m) => ({ default: m.CategoryComparisonChart }))
);
const ScoreHistorySection = lazy(() =>
  import("./sections/ScoreHistorySection").then((m) => ({ default: m.ScoreHistorySection }))
);
const ComparisonViewSection = lazy(() =>
  import("./sections/ComparisonViewSection").then((m) => ({ default: m.ComparisonViewSection }))
);
const RecruiterViewSection = lazy(() =>
  import("./sections/RecruiterViewSection").then((m) => ({ default: m.RecruiterViewSection }))
);

function ChartFallback() {
  return <Skeleton className="h-72 w-full rounded-2xl" />;
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-fluid-lg font-semibold">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-foreground-secondary">{subtitle}</p>}
    </div>
  );
}

function describeFetchError(error: unknown): { title: string; description: string } {
  const withResponse = error as { response?: { status?: number }; request?: unknown };
  const status = withResponse?.response?.status;

  if (status === 404) {
    return { title: "Resume not found", description: "This resume doesn't exist or you don't have access to it." };
  }
  if (status && status >= 500) {
    return { title: "Server error", description: "The server ran into a problem loading this analysis. Please try again shortly." };
  }
  if (!withResponse?.response && withResponse?.request) {
    return { title: "Couldn't reach the server", description: "Check your connection and try again." };
  }
  return { title: "Analysis failed", description: "Something went wrong loading this ATS analysis." };
}

export function AtsIntelligencePage() {
  const { resumeId } = useParams<{ resumeId?: string }>();

  const latestQuery = useLatestResume();
  const detailsQuery = useResumeDetails(resumeId);
  const historyQuery = useResumeHistory();

  const activeQuery = resumeId ? detailsQuery : latestQuery;
  const resume = activeQuery.data;
  const isLoading = activeQuery.isLoading || historyQuery.isLoading;
  const isError = activeQuery.isError || historyQuery.isError;

  const scoreHistory = useMemo(() => buildScoreHistory(historyQuery.data ?? []), [historyQuery.data]);
  const { previous, current } = useMemo(() => getComparisonPair(historyQuery.data ?? []), [historyQuery.data]);
  const previousScorecard = useMemo(() => {
    if (!resume || !historyQuery.data) return null;
    const sorted = [...historyQuery.data]
      .filter((r) => r.atsScorecard && r.createdAt < resume.createdAt)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sorted[0]?.atsScorecard ?? null;
  }, [resume, historyQuery.data]);

  return (
    <PageContainer className="relative overflow-hidden">
      <GradientBackground className="opacity-50" />
      <ParticleField count={16} className="opacity-60" />

      <div className="container-page relative z-10 flex flex-col gap-10 py-8">
        {isLoading && (
          <div className="flex flex-col gap-8">
            <Skeleton className="h-48 w-full rounded-3xl" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        )}

        {isError && !isLoading && (
          <ErrorState {...describeFetchError(activeQuery.error ?? historyQuery.error)} onRetry={() => activeQuery.refetch()} />
        )}

        {!isLoading && !isError && !resume && (
          <EmptyState
            icon={<FileSearch size={22} />}
            title="No resume analyzed yet"
            description="Upload a resume to unlock the full ATS intelligence dashboard."
            action={{ label: "Upload a resume", onClick: () => (window.location.href = "/resumes/upload") }}
          />
        )}

        {!isLoading && !isError && resume && !resume.atsScorecard && (
          <ErrorState
            title="Analysis failed"
            description="This resume couldn't be fully analyzed. Try re-uploading it from Resume Analysis."
          />
        )}

        {!isLoading && !isError && resume?.atsScorecard && (
          <FadeIn className="flex flex-col gap-10">
            <ScoreHeroSection scorecard={resume.atsScorecard} previousScore={previousScorecard?.overallScore ?? null} />

            <section>
              <SectionHeading title="Score Breakdown" subtitle="Every rule the ATS engine scores this resume on" />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {resume.atsScorecard.breakdown.map((item) => (
                  <AnalysisCategoryCard key={item.id} item={item} />
                ))}
              </div>
            </section>

            <section>
              <SectionHeading title="Keyword Analysis" subtitle="What the engine found vs. what it recommends adding" />
              <KeywordAnalysisSection breakdown={resume.atsScorecard.breakdown} />
            </section>

            <section>
              <SectionHeading title="Section Analysis" subtitle="Strengths, weaknesses and fixes per scoring category" />
              <SectionAnalysisSection scorecard={resume.atsScorecard} />
            </section>

            <section>
              <SectionHeading title="ATS Problems" subtitle="Issues worth fixing first, ranked by severity" />
              <AtsProblemsSection scorecard={resume.atsScorecard} />
            </section>

            <section>
              <SectionHeading title="AI Improvement Suggestions" />
              <SuggestionsList suggestions={resume.atsScorecard.top10Improvements} />
            </section>

            <ResumeHeatmapSection breakdown={resume.atsScorecard.breakdown} />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <Suspense fallback={<ChartFallback />}>
                <RadarScoreChart data={resume.atsScorecard.visualizationData.radarChartData} />
              </Suspense>
              <Suspense fallback={<ChartFallback />}>
                <CategoryComparisonChart data={resume.atsScorecard.visualizationData.categoryComparison} />
              </Suspense>
            </div>

            <section>
              <SectionHeading title="ATS Score History" subtitle="Real score across every analyzed version" />
              <Suspense fallback={<ChartFallback />}>
                <ScoreHistorySection history={scoreHistory} />
              </Suspense>
            </section>

            <section>
              <SectionHeading title="Comparison View" subtitle="Before vs. after your most recent re-upload" />
              <Suspense fallback={<ChartFallback />}>
                <ComparisonViewSection previous={previous} current={current} />
              </Suspense>
            </section>

            <section>
              <SectionHeading title="Recruiter View" />
              <Suspense fallback={<ChartFallback />}>
                <RecruiterViewSection scorecard={resume.atsScorecard} />
              </Suspense>
            </section>

            <ExportSection resume={resume} />
          </FadeIn>
        )}
      </div>
    </PageContainer>
  );
}
