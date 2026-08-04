import { lazy, Suspense, useState } from "react";
import { AlertCircle, FileSearch, Sparkles } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { GradientBackground } from "@/components/animations/GradientBackground";
import { ParticleField } from "@/components/animations/ParticleField";
import { FadeIn } from "@/components/animations/FadeIn";
import { GlassCard } from "@/components/cards/GlassCard";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useLatestResume } from "@/features/resume/hooks";
import { useAnalyzeCareerRoadmap, useUpdateRoadmapStepStatus } from "@/features/career/hooks";
import { useCareerPipeline } from "@/features/career/useCareerPipeline";
import { getLastTargetRole, saveLastTargetRole } from "@/features/career/recentTargetRole";
import { TargetRoleSelector } from "@/features/career/components/TargetRoleSelector";
import { CareerReadinessHero } from "@/features/career/components/CareerReadinessHero";
import { SkillGapAnalysisSection } from "@/features/career/components/SkillGapAnalysisSection";
import { RoadmapTimeline } from "@/features/career/components/RoadmapTimeline";
import { CertificationsGrid } from "@/features/career/components/CertificationsGrid";
import { LearningResourcesSection } from "@/features/career/components/LearningResourcesSection";
import { ProjectRecommendationsSection } from "@/features/career/components/ProjectRecommendationsSection";
import { CareerTimelineSection } from "@/features/career/components/CareerTimelineSection";
import { AiCareerInsightsPanel } from "@/features/career/components/AiCareerInsightsPanel";
import { CareerProcessingTimeline } from "@/features/career/components/CareerProcessingTimeline";
import { CareerExportSection } from "@/features/career/components/CareerExportSection";
import { targetRoles } from "@/pages/career/data";
import type { RoadmapStep } from "@/types";

// Recharts is code-split — same pattern as the ATS Intelligence, Resume
// Workspace, and Job Matching pages — so it only loads once there's a
// real result to chart.
const CareerRadarChart = lazy(() =>
  import("@/features/career/components/CareerRadarChart").then((m) => ({ default: m.CareerRadarChart }))
);

function ChartFallback() {
  return <Skeleton className="h-80 w-full rounded-2xl" />;
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-fluid-lg font-semibold">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-foreground-secondary">{subtitle}</p>}
    </div>
  );
}

function describeCareerError(error: unknown): { title: string; description: string } {
  const withResponse = error as { response?: { status?: number; data?: { message?: string } }; request?: unknown };
  const message = withResponse?.response?.data?.message;
  const status = withResponse?.response?.status;

  if (status === 404) {
    return { title: "Resume not found", description: "The selected resume couldn't be found for this analysis." };
  }
  if (status && status >= 500) {
    return { title: "Server error", description: message ?? "The career engine ran into a problem. Please try again shortly." };
  }
  if (!withResponse?.response && withResponse?.request) {
    return { title: "Couldn't reach the server", description: "Check your connection and try again." };
  }
  return { title: "Analysis failed", description: message ?? "Something went wrong building this career roadmap." };
}

export function CareerRoadmapPage() {
  const { data: resume, isLoading: isResumeLoading, isError: isResumeError, refetch: refetchResume } = useLatestResume();

  const [targetRole, setTargetRole] = useState<string | null>(() => getLastTargetRole());
  const [validationError, setValidationError] = useState<string | null>(null);
  const [localRoadmap, setLocalRoadmap] = useState<RoadmapStep[] | null>(null);
  const [pendingStepId, setPendingStepId] = useState<string | undefined>(undefined);

  const analyzeMutation = useAnalyzeCareerRoadmap();
  const progressMutation = useUpdateRoadmapStepStatus();
  const { statuses } = useCareerPipeline(analyzeMutation.isPending);

  const result = analyzeMutation.data;
  const roadmapSteps = localRoadmap ?? result?.roadmap ?? [];
  const skillGapSubtitle = result?.skillGapSummary?.missingSkills?.length
    ? `Priority gaps: ${result.skillGapSummary.missingSkills.slice(0, 3).map((item) => item.skill).join(", ")}`
    : "Current level vs. required level, by category";
  const showResults = Boolean(result) && !analyzeMutation.isPending;
  const showProcessing = analyzeMutation.isPending;
  const showInput = !showResults && !showProcessing;

  const selectedRoleLabel = targetRoles.find((r) => r.value === targetRole)?.label ?? "";

  function handleAnalyze() {
    setValidationError(null);

    if (!resume) {
      setValidationError("Upload a resume before running a skill gap analysis.");
      return;
    }
    if (!targetRole) {
      setValidationError("Select a target role so the AI knows what to compare your resume against.");
      return;
    }

    saveLastTargetRole(targetRole);
    setLocalRoadmap(null);
    analyzeMutation.mutate({ resumeId: resume._id, targetRole: selectedRoleLabel });
  }

  function handleAnalyzeAnother() {
    analyzeMutation.reset();
    setLocalRoadmap(null);
    setValidationError(null);
  }

  function handleToggleStep(step: RoadmapStep) {
    if (!result) return;
    const nextStatus: RoadmapStep["status"] = step.status === "completed" ? "not-started" : "completed";

    setPendingStepId(step.id);
    progressMutation.mutate(
      { resultId: result.id, stepId: step.id, status: nextStatus },
      {
        onSuccess: (updatedRoadmap) => setLocalRoadmap(updatedRoadmap),
        onError: () => {
          // Optimistic-free: leave roadmap as-is and let the user retry the toggle.
        },
        onSettled: () => setPendingStepId(undefined),
      }
    );
  }

  return (
    <PageContainer className="relative overflow-hidden">
      <GradientBackground className="opacity-50" />
      <ParticleField count={18} className="opacity-60" />

      <div className="container-page relative z-10 flex flex-col gap-10 py-8">
        {isResumeLoading && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Skeleton className="h-[420px] w-full rounded-3xl" />
            <Skeleton className="h-[420px] w-full rounded-3xl" />
          </div>
        )}

        {isResumeError && !isResumeLoading && (
          <ErrorState
            title="Couldn't load your resume"
            description="We couldn't check which resume is selected for this analysis."
            onRetry={() => refetchResume()}
          />
        )}

        {!isResumeLoading && !isResumeError && !resume && (
          <EmptyState
            icon={<FileSearch size={22} />}
            title="No resume selected"
            description="Upload a resume first so the AI has something to compare against your target role."
            action={{ label: "Upload a resume", onClick: () => (window.location.href = "/resumes/upload") }}
          />
        )}

        {!isResumeLoading && !isResumeError && resume && showInput && (
          <FadeIn className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-foreground-secondary">
                <Sparkles size={13} className="text-accent-cyan" />
                AI Skill Gap Analysis
              </div>
              <h1 className="text-fluid-2xl font-extrabold tracking-tight">
                Build your <span className="text-gradient">Career Roadmap</span>
              </h1>
              <p className="max-w-xl text-sm text-foreground-secondary sm:text-base">
                Understand your strengths and build a personalized roadmap to your dream role.
              </p>
            </div>

            <GlassCard className="flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Target Role</h3>
                <p className="mt-0.5 text-xs text-foreground-secondary">
                  Pick the role you're aiming for — the AI compares your resume's skills against it.
                </p>
              </div>
              <TargetRoleSelector options={targetRoles} value={targetRole} onChange={setTargetRole} />
            </GlassCard>

            {validationError && (
              <GlassCard className="flex items-center gap-3 border border-danger/30 bg-danger/[0.04]">
                <AlertCircle size={18} className="shrink-0 text-danger" />
                <p className="text-sm text-foreground">{validationError}</p>
              </GlassCard>
            )}

            {analyzeMutation.isError && (
              <ErrorState {...describeCareerError(analyzeMutation.error)} onRetry={handleAnalyze} />
            )}

            <div className="flex justify-center">
              <Button variant="gradient" size="lg" onClick={handleAnalyze} disabled={analyzeMutation.isPending}>
                <Sparkles size={16} /> Run AI Skill Gap Analysis
              </Button>
            </div>
          </FadeIn>
        )}

        {showProcessing && <CareerProcessingTimeline statuses={statuses} />}

        {showResults && result && (
          <FadeIn className="flex flex-col gap-10">
            <CareerReadinessHero
              targetRole={result.targetRole}
              careerReadinessScore={result.careerReadinessScore}
              readinessStatus={result.readinessStatus}
              estimatedTimeToTarget={result.estimatedTimeToTarget}
              projectedReadinessScore={result.roadmapPlan?.jobReadinessScore}
            />

            <section>
              <SectionHeading title="Skill Gap Analysis" subtitle={skillGapSubtitle} />
              <SkillGapAnalysisSection categories={result.skillGap} />
            </section>

            <Suspense fallback={<ChartFallback />}>
              <CareerRadarChart data={result.radarChartData} />
            </Suspense>

            <section>
              <SectionHeading title="Learning Roadmap" subtitle="Your step-by-step path to the target role" />
              <RoadmapTimeline steps={roadmapSteps} onToggleStep={handleToggleStep} pendingStepId={pendingStepId} />
            </section>

            <section>
              <SectionHeading title="Recommended Certifications" subtitle="Credentials that strengthen this application" />
              <CertificationsGrid certifications={result.certifications} />
            </section>

            <section>
              <SectionHeading title="Recommended Learning Resources" subtitle="Curated videos, courses, books, and practice platforms" />
              <LearningResourcesSection resources={result.learningResources} />
            </section>

            <section>
              <SectionHeading title="Project Recommendations" subtitle="Portfolio projects that close your biggest gaps" />
              <ProjectRecommendationsSection projects={result.projectRecommendations} />
            </section>

            <section>
              <SectionHeading title="Career Timeline" subtitle="Where you are, and what's ahead" />
              <CareerTimelineSection stops={result.careerTimeline} />
            </section>

            <section>
              <SectionHeading title="AI Insights" subtitle="Strengths, gaps, and advice tailored to this analysis" />
              <AiCareerInsightsPanel insights={result.insights} />
            </section>

            <div className="flex flex-col gap-4">
              <CareerExportSection result={result} />
              <div className="flex justify-center">
                <Button variant="outline" onClick={handleAnalyzeAnother}>
                  Analyze a different role
                </Button>
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </PageContainer>
  );
}
