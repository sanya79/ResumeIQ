import { useMemo } from "react";
import { BarChart3, TrendingUp, Sparkles, Target, FileText, CheckCircle2 } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { GradientBackground } from "@/components/animations/GradientBackground";
import { ParticleField } from "@/components/animations/ParticleField";
import { FadeIn } from "@/components/animations/FadeIn";
import { GlassCard } from "@/components/cards/GlassCard";
import { MetricCard } from "@/components/cards/MetricCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useAnalyticsOverview } from "@/services/analytics.api";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";

export function AnalyticsPage() {
  const { data: overview, isLoading, isError, refetch } = useAnalyticsOverview();

  const scoreCards = useMemo(() => overview?.scoreCards ?? [], [overview]);
  const scoreHistory = useMemo(() => overview?.resumeScoreHistory ?? [], [overview]);
  const atsTrend = useMemo(() => overview?.atsTrend ?? [], [overview]);
  const applicationData = useMemo(() => {
    const apps = overview?.applicationsSent ?? [];
    const rates = overview?.interviewRate ?? [];
    return apps.map((item, idx) => ({
      week: item.week,
      applications: item.applications,
      interviews: rates[idx]?.rate ?? 0,
    }));
  }, [overview]);

  return (
    <PageContainer className="relative overflow-hidden">
      <GradientBackground className="opacity-50" />
      <ParticleField count={18} className="opacity-60" />

      <div className="container-page relative z-10 flex flex-col gap-8 py-8">
        <FadeIn className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-foreground-secondary">
            <BarChart3 size={14} className="text-accent-purple" /> Deep Performance Analytics
          </div>
          <h1 className="text-fluid-2xl font-extrabold tracking-tight">
            Comprehensive <span className="text-gradient">Career Intelligence</span>
          </h1>
          <p className="max-w-2xl text-sm text-foreground-secondary sm:text-base">
            Track your ATS score improvement, keyword density trends, application response rates, and career progression metrics over time.
          </p>
        </FadeIn>

        {isLoading && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton key={idx} className="h-32 w-full rounded-2xl" />
              ))}
            </div>
            <Skeleton className="h-80 w-full rounded-3xl" />
          </div>
        )}

        {isError && !isLoading && (
          <ErrorState
            title="Couldn't load analytics data"
            description="We ran into a problem fetching your performance overview."
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && (
          <FadeIn className="flex flex-col gap-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {scoreCards.map((card) => (
                <MetricCard
                  key={card.id}
                  label={card.label}
                  value={card.value}
                  description={card.description}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <GlassCard className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-fluid-lg font-bold text-foreground">ATS Score Trajectory</h3>
                    <p className="text-xs text-foreground-secondary">Monthly average ATS scorecard ratings</p>
                  </div>
                  <span className="inline-flex rounded-xl bg-accent-purple/10 p-2.5 text-accent-purple">
                    <TrendingUp size={18} />
                  </span>
                </div>

                <div className="h-72 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={scoreHistory}>
                      <defs>
                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="month" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#111827",
                          borderColor: "rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#8B5CF6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#scoreGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              <GlassCard className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-fluid-lg font-bold text-foreground">Category Breakdown Trends</h3>
                    <p className="text-xs text-foreground-secondary">Keywords, Formatting & Readability progression</p>
                  </div>
                  <span className="inline-flex rounded-xl bg-accent-cyan/10 p-2.5 text-accent-cyan">
                    <Sparkles size={18} />
                  </span>
                </div>

                <div className="h-72 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={atsTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="month" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#111827",
                          borderColor: "rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="keyword" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Keyword Relevance" />
                      <Bar dataKey="formatting" fill="#22D3EE" radius={[4, 4, 0, 0]} name="Formatting Quality" />
                      <Bar dataKey="readability" fill="#34D399" radius={[4, 4, 0, 0]} name="Readability" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </div>

            <GlassCard className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-fluid-lg font-bold text-foreground">Applications & Interview Conversion</h3>
                  <p className="text-xs text-foreground-secondary">Weekly applications sent vs interview callback percentage</p>
                </div>
                <span className="inline-flex rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
                  <Target size={18} />
                </span>
              </div>

              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={applicationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="week" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111827",
                        borderColor: "rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="applications" fill="#60A5FA" radius={[4, 4, 0, 0]} name="Applications Sent" />
                    <Bar dataKey="interviews" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Interview Rate (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <GlassCard className="flex flex-col gap-4">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <CheckCircle2 size={16} className="text-emerald-400" /> Key Analytics Highlights
                </div>
                <ul className="space-y-3 text-sm text-foreground-secondary">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent-purple" />
                    <span>Your overall ATS score has improved by <strong>+26%</strong> over the past 6 months.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent-cyan" />
                    <span>Keyword relevance is your highest performing metric, averaging <strong>88/100</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>Interview callback rate hit a peak of <strong>30%</strong> in the latest review window.</span>
                  </li>
                </ul>
              </GlassCard>

              <GlassCard className="flex flex-col gap-4">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <FileText size={16} className="text-accent-cyan" /> Recommendations to Boost Conversion
                </div>
                <ul className="space-y-3 text-sm text-foreground-secondary">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400" />
                    <span>Quantify bullet points with metrics (e.g. %, $, team sizes) to increase ATS readability score.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent-purple" />
                    <span>Run a Job Match analysis before submitting each application to target role-specific missing terms.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent-cyan" />
                    <span>Complete 1-2 AI Mock Interviews per week to keep response confidence high.</span>
                  </li>
                </ul>
              </GlassCard>
            </div>
          </FadeIn>
        )}
      </div>
    </PageContainer>
  );
}

export default AnalyticsPage;
