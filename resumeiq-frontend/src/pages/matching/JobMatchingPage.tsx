import { lazy, Suspense, useState } from "react";
import { FileSearch, Sparkles, AlertCircle } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { GradientBackground } from "@/components/animations/GradientBackground";
import { ParticleField } from "@/components/animations/ParticleField";
import { FadeIn } from "@/components/animations/FadeIn";
import { GlassCard } from "@/components/cards/GlassCard";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useLatestResume } from "@/features/resume/hooks";
import { downloadGeneratedResumePdf } from "@/services/matching.api";
import { useAnalyzeJobMatch } from "@/features/matching/hooks";
import { useMatchPipeline } from "@/features/matching/useMatchPipeline";
import { saveRecentJobDescription } from "@/features/matching/recentJobDescriptions";
import { JobDescriptionPanel } from "@/features/matching/components/JobDescriptionPanel";
import { ResumeSummaryPanel } from "@/features/matching/components/ResumeSummaryPanel";
import { ProcessingTimeline } from "@/features/matching/components/ProcessingTimeline";
import { MatchScoreHero } from "@/features/matching/components/MatchScoreHero";
import { MatchBreakdownGrid } from "@/features/matching/components/MatchBreakdownGrid";
import { KeywordComparisonPanel } from "@/features/matching/components/KeywordComparisonPanel";
import { SkillGapPanel } from "@/features/matching/components/SkillGapPanel";
import { ExperienceAndProjectsPanel } from "@/features/matching/components/ExperienceAndProjectsPanel";
import { RecommendationsPanel } from "@/features/matching/components/RecommendationsPanel";
import { HiringProbabilityPanel } from "@/features/matching/components/HiringProbabilityPanel";
import { ActionPanel } from "@/features/matching/components/ActionPanel";

// Recharts is code-split — same pattern as the ATS Intelligence and Resume
// Workspace pages — so it only loads once there's a real result to chart.
const MatchRadarChart = lazy(() =>
  import("@/features/matching/components/MatchCharts").then((m) => ({ default: m.MatchRadarChart }))
);
const KeywordDistributionChart = lazy(() =>
  import("@/features/matching/components/MatchCharts").then((m) => ({ default: m.KeywordDistributionChart }))
);

const MIN_JD_LENGTH = 50;

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

function describeMatchError(error: unknown): { title: string; description: string } {
  const withResponse = error as { response?: { status?: number; data?: { message?: string } }; request?: unknown };
  const message = withResponse?.response?.data?.message;
  const status = withResponse?.response?.status;

  if (status === 404) {
    return { title: "Resume not found", description: "The selected resume couldn't be found for matching." };
  }
  if (status && status >= 500) {
    return { title: "Server error", description: message ?? "The matching engine ran into a problem. Please try again shortly." };
  }
  if (!withResponse?.response && withResponse?.request) {
    return { title: "Couldn't reach the server", description: "Check your connection and try again." };
  }
  return { title: "Analysis failed", description: message ?? "Something went wrong matching this resume against the job." };
}

export function JobMatchingPage() {
  const { user } = useAuth();
  const toast = useToast();
  const { data: resume, isLoading: isResumeLoading, isError: isResumeError, refetch: refetchResume } = useLatestResume();

  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const matchMutation = useAnalyzeJobMatch();
  const { statuses } = useMatchPipeline(matchMutation.isPending);

  const match = matchMutation.data;
  const showResults = Boolean(match) && !matchMutation.isPending;
  const showProcessing = matchMutation.isPending;
  const showInput = !showResults && !showProcessing;

  function handleAnalyze() {
    setValidationError(null);

    if (!resume) {
      setValidationError("Upload a resume before running a job match.");
      return;
    }
    if (jobDescription.trim().length < MIN_JD_LENGTH) {
      setValidationError(`Paste a fuller job description (at least ${MIN_JD_LENGTH} characters) for an accurate match.`);
      return;
    }

    saveRecentJobDescription(jobDescription, jobTitle, company);
    matchMutation.mutate({
      resumeId: resume._id,
      jobDescription: jobDescription.trim(),
      jobTitle: jobTitle.trim() || undefined,
      company: company.trim() || undefined,
    });
  }

  function handleAnalyzeAnother() {
    matchMutation.reset();
    setJobDescription("");
    setJobTitle("");
    setCompany("");
    setValidationError(null);
  }

  async function handleDownloadTailoredResume() {
    if (!match) return;
    try {
      await downloadGeneratedResumePdf(match.id);
      toast.success("Tailored resume ready", "Your PDF download has started.");
    } catch {
      toast.error("Download failed", "The tailored resume PDF couldn't be generated right now.");
    }
  }

  return (
    <PageContainer className="relative overflow-hidden">
      <GradientBackground className="opacity-50" />
      <ParticleField count={18} className="opacity-60" />

      <div className="container-page relative z-10 flex flex-col gap-10 py-8">
        <FadeIn>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-foreground-secondary">
              <Sparkles size={13} className="text-accent-cyan" />
              AI Job Matching Engine
            </div>
            <h1 className="text-fluid-2xl font-extrabold tracking-tight">
              Match your resume to <span className="text-gradient">any job</span>
            </h1>
          </div>
        </FadeIn>

        {isResumeLoading && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Skeleton className="h-[420px] w-full rounded-3xl" />
            <Skeleton className="h-[420px] w-full rounded-3xl" />
          </div>
        )}

        {isResumeError && !isResumeLoading && (
          <ErrorState
            title="Couldn't load your resume"
            description="We couldn't check which resume is selected for matching."
            onRetry={() => refetchResume()}
          />
        )}

        {!isResumeLoading && !isResumeError && !resume && (
          <EmptyState
            icon={<FileSearch size={22} />}
            title="No resume selected"
            description="Upload a resume first so the AI has something to match against job descriptions."
            action={{ label: "Upload a resume", onClick: () => (window.location.href = "/resumes/upload") }}
          />
        )}

        {!isResumeLoading && !isResumeError && resume && showInput && (
          <FadeIn className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <JobDescriptionPanel
                value={jobDescription}
                onChange={setJobDescription}
                jobTitle={jobTitle}
                onJobTitleChange={setJobTitle}
                company={company}
                onCompanyChange={setCompany}
              />
              <ResumeSummaryPanel resume={resume} user={user} />
            </div>

            {validationError && (
              <GlassCard className="flex items-center gap-3 border border-danger/30 bg-danger/[0.04]">
                <AlertCircle size={18} className="shrink-0 text-danger" />
                <p className="text-sm text-foreground">{validationError}</p>
              </GlassCard>
            )}

            {matchMutation.isError && (
              <ErrorState {...describeMatchError(matchMutation.error)} onRetry={handleAnalyze} />
            )}

            <div className="flex justify-center">
              <Button variant="gradient" size="lg" onClick={handleAnalyze} disabled={matchMutation.isPending}>
                <Sparkles size={16} /> Run AI Job Match
              </Button>
            </div>
          </FadeIn>
        )}

        {showProcessing && <ProcessingTimeline statuses={statuses} />}

        {showResults && match && (
          <FadeIn className="flex flex-col gap-10">
            <MatchScoreHero match={match} jobTitle={jobTitle} company={company} />

            <section>
              <SectionHeading title="Match Breakdown" subtitle="Every category the AI scores this match on" />
              <MatchBreakdownGrid items={match.categoryBreakdown} />
            </section>

            <section>
              <SectionHeading title="Keyword Comparison" subtitle="What your resume already has vs. what the role wants" />
              <KeywordComparisonPanel matched={match.matchedKeywords} missing={match.missingKeywords} />
            </section>

            <section>
              <SectionHeading title="Skill Gap Analysis" subtitle="Current level vs. required level, by category" />
              <SkillGapPanel categories={match.skillGap} />
            </section>

            <section>
              <SectionHeading title="Experience & Project Relevance" />
              <ExperienceAndProjectsPanel experience={match.experienceMatch} projects={match.projectRelevance} />
            </section>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <Suspense fallback={<ChartFallback />}>
                <MatchRadarChart data={match.visualizationData.radarChartData} />
              </Suspense>
              <Suspense fallback={<ChartFallback />}>
                <KeywordDistributionChart data={match.visualizationData.keywordDistribution} />
              </Suspense>
            </div>

            <section>
              <SectionHeading title="AI Recommendations" subtitle="Improvement plan, one step at a time" />
              <RecommendationsPanel recommendations={match.recommendations} />
            </section>

            <section>
              <SectionHeading title="Hiring Probability" />
              <HiringProbabilityPanel probability={match.hiringProbability} />
            </section>

            <GlassCard className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Tailored Resume Builder</h3>
                <p className="mt-0.5 text-xs text-foreground-secondary">
                  Turn this job description into a polished PDF resume that highlights the right keywords and gaps.
                </p>
              </div>
              <Button variant="gradient" size="sm" onClick={handleDownloadTailoredResume}>
                <Sparkles size={14} /> Download tailored resume PDF
              </Button>
            </GlassCard>

            <ActionPanel match={match} onAnalyzeAnother={handleAnalyzeAnother} />
          </FadeIn>
        )}
      </div>
    </PageContainer>
  );
}
