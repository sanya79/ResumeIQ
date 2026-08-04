import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/hooks/useToast";
import { RefreshCcw, Sparkles, UploadCloud, History, GitCompare, FileText, Wand2, Network } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { GradientBackground } from "@/components/animations/GradientBackground";
import { ParticleField } from "@/components/animations/ParticleField";
import { FadeIn } from "@/components/animations/FadeIn";
import { SlideUp } from "@/components/animations/SlideUp";
import { GlassCard } from "@/components/cards/GlassCard";
import { ATSScoreCard } from "@/components/cards/ATSScoreCard";
import { TimelineCard, type TimelineStep } from "@/components/cards/TimelineCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { useApplyResumeOptimization, useCompareResumeVersions, useLatestResume, useOptimizeResume, useResumeKnowledgeGraph, useResumeOptimizations, useResumeVersions, useUploadResume } from "@/features/resume/hooks";
import { useAnalysisPipeline } from "@/features/resume/useAnalysisPipeline";
import { Dropzone } from "@/features/resume/components/Dropzone";
import { UploadProgressTimeline } from "@/features/resume/components/UploadProgressTimeline";
import { ResumeTextPreview } from "@/features/resume/components/ResumeTextPreview";
import { ResumeMetaCard } from "@/features/resume/components/ResumeMetaCard";
import { StrengthsWeaknessesPanel } from "@/features/resume/components/StrengthsWeaknessesPanel";
import { SuggestionsList } from "@/features/resume/components/SuggestionsList";
import { AnalysisCategoryCard } from "@/features/resume/components/AnalysisCategoryCard";
import { StructuredProfileComingSoon } from "@/features/resume/components/StructuredProfileComingSoon";
import { ResumeChatAssistant } from "@/features/resume/components/ResumeChatAssistant";
import { downloadOptimizedResumePdf } from "@/services/resume.api";
import type { ResumeOptimization } from "@/types";

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
  const compareMutation = useCompareResumeVersions();
  const optimizeMutation = useOptimizeResume();
  const applyOptimizationMutation = useApplyResumeOptimization();
  const toast = useToast();
  const { statuses } = useAnalysisPipeline(uploadMutation.isPending);
  const [showUploadFlow, setShowUploadFlow] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [compareFrom, setCompareFrom] = useState("");
  const [compareTo, setCompareTo] = useState("");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [targetCompanyPreset, setTargetCompanyPreset] = useState("Other");
  const [targetCompany, setTargetCompany] = useState("");
  const [activeTab, setActiveTab] = useState<"analysis" | "graph">("analysis");
  const [activeOptimization, setActiveOptimization] = useState<ResumeOptimization | null>(null);

  const resume = uploadMutation.data ?? latestResume;
  const { data: versions = [] } = useResumeVersions(resume?._id);
  const { data: optimizations = [] } = useResumeOptimizations(resume?._id);
  const { data: graphData } = useResumeKnowledgeGraph(resume?._id);
  const graphNodes = graphData?.nodes ?? [];
  const graphEdges = graphData?.edges ?? [];
  const isShowingAnalysis = resume && !showUploadFlow && !uploadMutation.isPending;

  const graphLayout = useMemo(() => {
    if (!graphNodes.length) return [] as Array<{ id: string; x: number; y: number; label: string; type: string; size: number }>;

    const center = { x: 250, y: 200 };
    const typeOrder = { skill: 0, project: 1, experience: 2, certification: 3 };

    return graphNodes.map((node, index) => {
      const typeIndex = typeOrder[node.type as keyof typeof typeOrder] ?? 0;
      const angle = (index / Math.max(graphNodes.length, 1)) * Math.PI * 2;
      const ring = Math.floor(index / 4);
      const radius = 70 + ring * 28 + typeIndex * 12;
      const x = center.x + Math.cos(angle + typeIndex) * radius;
      const y = center.y + Math.sin(angle + typeIndex) * radius;

      return {
        id: node.id,
        x,
        y,
        label: node.label,
        type: node.type,
        size: node.size ?? 16,
      };
    });
  }, [graphNodes]);

  const graphNodeMap = useMemo(() => new Map(graphLayout.map((node) => [node.id, node])), [graphLayout]);

  useEffect(() => {
    if (!versions.length) return;
    if (!compareFrom) setCompareFrom(versions[0]._id);
    if (!compareTo) setCompareTo(versions[1]?._id ?? versions[0]._id);
  }, [compareFrom, compareTo, versions]);

  useEffect(() => {
    setActiveOptimization(null);
  }, [resume?._id]);

  function handleFileAccepted(file: File) {
    setClientError(null);
    uploadMutation.reset();
    uploadMutation.mutate({ file, uploadSource: "Web Dashboard" }, { onSuccess: () => setShowUploadFlow(false) });
  }

  function handleCompareVersions() {
    if (!compareFrom || !compareTo || compareFrom === compareTo) return;
    compareMutation.mutate({ from: compareFrom, to: compareTo });
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

  function handleGenerateOptimization() {
    if (!resume?._id) return;
    const companyValue = targetCompanyPreset === "Other" ? targetCompany : targetCompanyPreset;
    optimizeMutation.mutate({ id: resume._id, targetRole, targetCompany: companyValue }, {
      onSuccess: (optimization) => setActiveOptimization(optimization),
    });
  }

  function handleApplyOptimization() {
    if (!resume?._id || !activeOptimization) return;

    const draftedText = [
      "AI-optimized professional summary",
      "",
      activeOptimization.rewrittenSummary,
      "",
      "Key highlights",
      ...activeOptimization.rewrittenBullets.map((bullet) => `- ${bullet}`),
      "",
      resume.rawText || "",
    ].join("\n");

    applyOptimizationMutation.mutate({ id: resume._id, rawText: draftedText }, {
      onSuccess: () => {
        setActiveOptimization(null);
        toast.success("Resume draft updated", "The suggested summary and bullets have been applied to your current resume draft.");
      },
      onError: () => {
        toast.error("Update failed", "The suggested text couldn't be applied right now.");
      },
    });
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

              <div className="flex gap-2">
                <Button variant={activeTab === "analysis" ? "gradient" : "outline"} size="sm" onClick={() => setActiveTab("analysis")}>
                  Analysis
                </Button>
                <Button variant={activeTab === "graph" ? "gradient" : "outline"} size="sm" onClick={() => setActiveTab("graph")}>
                  <Network size={14} /> Graph view
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
                <div className="min-h-[520px]">
                  <ResumeTextPreview fileName={resume.originalName} rawText={resume.rawText} />
                </div>
                <div className="flex flex-col gap-5">
                  <ResumeMetaCard resume={resume} />
                  {resume.atsScorecard && <ATSScoreCard result={resume.atsScorecard} />}
                </div>
              </div>

              {activeTab === "analysis" && resume.atsScorecard && (
                <>
                  <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-2xl border border-surface-border bg-background-secondary/70 p-4">
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <FileText size={16} className="text-accent-cyan" /> Resume snapshot
                      </div>
                      <p className="text-sm text-foreground-secondary">
                        {resume.comparisonSummary || "Resume has been parsed and stored for version tracking."}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-surface-border bg-background-secondary/70 p-4">
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <GitCompare size={16} className="text-accent-purple" /> Version comparison
                      </div>
                      <p className="text-sm text-foreground-secondary">
                        Comparing version {resume.version} with previous uploaded versions is now supported in your history timeline.
                      </p>
                    </div>
                  </div>

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

              {activeTab === "graph" && (
                <div className="rounded-2xl border border-surface-border bg-background-secondary/70 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Network size={16} className="text-accent-cyan" /> Graph view
                  </div>

                  {graphNodes.length === 0 ? (
                    <p className="text-sm text-foreground-secondary">No graph data is available yet for this resume.</p>
                  ) : (
                    <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-background/70 p-4">
                      <svg viewBox="0 0 520 420" className="h-[420px] w-full">
                        <defs>
                          <linearGradient id="graph-link" x1="0%" x2="100%" y1="0%" y2="0%">
                            <stop offset="0%" stopColor="rgba(139, 92, 246, 0.4)" />
                            <stop offset="100%" stopColor="rgba(34, 211, 238, 0.45)" />
                          </linearGradient>
                        </defs>
                        {graphEdges.map((edge, index) => {
                          const source = graphNodeMap.get(edge.source);
                          const target = graphNodeMap.get(edge.target);
                          if (!source || !target) return null;

                          return (
                            <line
                              key={`${edge.source}-${edge.target}-${index}`}
                              x1={source.x}
                              y1={source.y}
                              x2={target.x}
                              y2={target.y}
                              stroke="url(#graph-link)"
                              strokeWidth={1.4}
                              opacity={0.9}
                            />
                          );
                        })}

                        {graphLayout.map((node) => {
                          const colorMap = {
                            skill: "#8B5CF6",
                            project: "#22D3EE",
                            experience: "#34D399",
                            certification: "#F59E0B",
                          };

                          return (
                            <g key={node.id}>
                              <circle
                                cx={node.x}
                                cy={node.y}
                                r={node.size}
                                fill={colorMap[node.type as keyof typeof colorMap] ?? "#A78BFA"}
                                opacity={0.9}
                              />
                              <text
                                x={node.x}
                                y={node.y + 4}
                                textAnchor="middle"
                                fontSize={10}
                                fontWeight={600}
                                fill="#E5E7EB"
                              >
                                {node.label.length > 10 ? `${node.label.slice(0, 9)}…` : node.label}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  )}
                </div>
              )}

              {resume.status === "Failed" && (
                <ErrorState
                  title="Analysis failed"
                  description="This resume couldn't be fully analyzed. Try re-uploading it."
                  onRetry={() => setShowUploadFlow(true)}
                />
              )}

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-2xl border border-surface-border bg-background-secondary/70 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <History size={16} className="text-accent-cyan" /> Resume history
                  </div>
                  {versions.length > 0 ? (
                    <TimelineCard
                      steps={versions.map((item, index): TimelineStep => ({
                        title: `Version ${item.version} · ${item.originalName}`,
                        description: `${item.status} • ${new Date(item.createdAt).toLocaleDateString()}`,
                        status: item._id === resume._id ? "current" : index === versions.length - 1 ? "upcoming" : "complete",
                      }))}
                    />
                  ) : (
                    <p className="text-sm text-foreground-secondary">No prior versions yet. Upload another resume to build your history.</p>
                  )}
                </div>

                <div className="rounded-2xl border border-surface-border bg-background-secondary/70 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <GitCompare size={16} className="text-accent-purple" /> Compare versions
                  </div>
                  <p className="text-sm text-foreground-secondary">
                    Compare two uploaded versions to inspect added or removed skills and section changes.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="text-sm text-foreground-secondary">
                      <span className="mb-1 block">From</span>
                      <select
                        value={compareFrom}
                        onChange={(e) => setCompareFrom(e.target.value)}
                        className="w-full rounded-xl border border-surface-border bg-background/70 px-3 py-2 text-sm text-foreground"
                      >
                        {versions.map((item) => (
                          <option key={item._id} value={item._id}>Version {item.version}</option>
                        ))}
                      </select>
                    </label>
                    <label className="text-sm text-foreground-secondary">
                      <span className="mb-1 block">To</span>
                      <select
                        value={compareTo}
                        onChange={(e) => setCompareTo(e.target.value)}
                        className="w-full rounded-xl border border-surface-border bg-background/70 px-3 py-2 text-sm text-foreground"
                      >
                        {versions.map((item) => (
                          <option key={item._id} value={item._id}>Version {item.version}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <Button variant="secondary" size="sm" className="mt-3" onClick={handleCompareVersions} disabled={compareMutation.isPending || !compareFrom || !compareTo || compareFrom === compareTo}>
                    {compareMutation.isPending ? <LoadingSpinner size={14} label="Comparing..." /> : <><GitCompare size={14} /> Compare</>}
                  </Button>
                  {compareMutation.isPending && <Skeleton className="mt-3 h-24 w-full rounded-2xl" />}
                  {compareMutation.isError && <p className="mt-3 text-sm text-danger">Unable to compare these versions right now.</p>}
                  {compareMutation.data && (
                    <div className="mt-4 space-y-3 rounded-xl border border-surface-border/70 bg-background/70 p-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge tone="emerald">Added skills: {compareMutation.data.addedSkills.length}</Badge>
                        <Badge tone="danger">Removed skills: {compareMutation.data.removedSkills.length}</Badge>
                      </div>
                      {compareMutation.data.addedSkills.length > 0 && (
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground-secondary">Added</p>
                          <div className="flex flex-wrap gap-2">
                            {compareMutation.data.addedSkills.map((skill) => <Badge key={skill} tone="emerald">{skill}</Badge>)}
                          </div>
                        </div>
                      )}
                      {compareMutation.data.removedSkills.length > 0 && (
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground-secondary">Removed</p>
                          <div className="flex flex-wrap gap-2">
                            {compareMutation.data.removedSkills.map((skill) => <Badge key={skill} tone="danger">{skill}</Badge>)}
                          </div>
                        </div>
                      )}
                      {compareMutation.data.sectionDiffs.length > 0 && (
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground-secondary">Section changes</p>
                          <div className="flex flex-wrap gap-2">
                            {compareMutation.data.sectionDiffs.map((section) => <Badge key={section.section} tone="purple">{section.section}</Badge>)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-surface-border bg-background-secondary/70 p-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Wand2 size={16} className="text-accent-purple" /> AI Optimize
                  </div>
                  <Badge tone="purple">Tailored rewrite</Badge>
                </div>
                <p className="text-sm text-foreground-secondary">
                  Generate a concise, role-specific rewrite for your resume summary and bullet points, then apply it as a new draft.
                </p>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <Input
                    label="Target role"
                    value={targetRole}
                    onChange={(event) => setTargetRole(event.target.value)}
                    placeholder="Software Engineer"
                  />
                  <div className="flex flex-col gap-3">
                    <Select
                      label="Target company"
                      value={targetCompanyPreset}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        setTargetCompanyPreset(nextValue);
                        if (nextValue !== "Other") {
                          setTargetCompany("");
                        }
                      }}
                      options={[
                        { label: "Google", value: "Google" },
                        { label: "Amazon", value: "Amazon" },
                        { label: "Microsoft", value: "Microsoft" },
                        { label: "Adobe", value: "Adobe" },
                        { label: "Uber", value: "Uber" },
                        { label: "Other", value: "Other" },
                      ]}
                      placeholder="Select a company"
                    />
                    {targetCompanyPreset === "Other" && (
                      <Input
                        label="Other company"
                        value={targetCompany}
                        onChange={(event) => setTargetCompany(event.target.value)}
                        placeholder="Acme Labs"
                      />
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Button variant="gradient" size="sm" onClick={handleGenerateOptimization} disabled={optimizeMutation.isPending || !resume?._id}>
                    {optimizeMutation.isPending ? <LoadingSpinner size={14} label="Generating..." /> : <><Sparkles size={14} /> Generate AI suggestions</>}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleApplyOptimization} disabled={applyOptimizationMutation.isPending || !activeOptimization}>
                    {applyOptimizationMutation.isPending ? <LoadingSpinner size={14} label="Applying..." /> : <><Wand2 size={14} /> Apply to draft</>}
                  </Button>
                </div>

                {optimizeMutation.isError && (
                  <p className="mt-3 text-sm text-danger">We couldn’t generate an optimization right now. Please try again.</p>
                )}

                {(() => {
                  const optimization = activeOptimization ?? optimizations[0] ?? null;
                  if (!optimization) return null;
                  return (
                    <div className="mt-5 space-y-4 rounded-xl border border-surface-border/70 bg-background/70 p-4">
                      <div className="rounded-xl border border-surface-border/70 bg-background-secondary/70 p-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground-secondary">Suggested summary</p>
                        <p className="text-sm text-foreground">{optimization.rewrittenSummary}</p>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="rounded-xl border border-surface-border/70 bg-background-secondary/70 p-4">
                          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground-secondary">Suggested bullets</p>
                          <ul className="space-y-2 text-sm text-foreground-secondary">
                            {optimization.rewrittenBullets.map((bullet) => (
                              <li key={bullet} className="flex gap-2">
                                <span className="mt-1 h-2 w-2 rounded-full bg-accent-purple" />
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="rounded-xl border border-surface-border/70 bg-background-secondary/70 p-4">
                          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground-secondary">Impact suggestions</p>
                          <ul className="space-y-2 text-sm text-foreground-secondary">
                            {optimization.quantifiedImpactSuggestions.map((suggestion) => (
                              <li key={suggestion} className="flex gap-2">
                                <span className="mt-1 h-2 w-2 rounded-full bg-accent-cyan" />
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="rounded-xl border border-surface-border/70 bg-background-secondary/70 p-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground-secondary">Tailoring notes</p>
                        <ul className="space-y-2 text-sm text-foreground-secondary">
                          {optimization.tailoringNotes.map((note) => (
                            <li key={note} className="flex gap-2">
                              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                              <span>{note}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <StructuredProfileComingSoon />
            </motion.div>
          )}
        </AnimatePresence>

        {resume?._id && <ResumeChatAssistant resumeId={resume._id} className="fixed bottom-6 right-6 z-40" />}
      </div>
    </PageContainer>
  );
}
