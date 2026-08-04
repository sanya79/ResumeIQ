import { useMemo, useState } from "react";
import { Github, Sparkles, Search } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { GradientBackground } from "@/components/animations/GradientBackground";
import { ParticleField } from "@/components/animations/ParticleField";
import { FadeIn } from "@/components/animations/FadeIn";
import { GlassCard } from "@/components/cards/GlassCard";
import { AnalyticsCard } from "@/components/cards/AnalyticsCard";
import { MetricCard } from "@/components/cards/MetricCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { apiClient } from "@/services/apiClient";
import type { ApiResponse } from "@/types";

interface GitHubAnalysis {
  repoQualityScore: number;
  readmeScore: number;
  commitActivity: number;
  languageDistribution: Array<{ name: string; value: number }>;
  projectDiversity: number;
  contributionSummary: string;
  portfolioScore: number;
}

export function GitHubPortfolioPage() {
  const [githubUsername, setGithubUsername] = useState("");
  const [analysis, setAnalysis] = useState<GitHubAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chartsData = useMemo(() => analysis?.languageDistribution ?? [], [analysis]);

  async function handleConnect() {
    if (!githubUsername.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const { data } = await apiClient.post<ApiResponse<{ analysis: GitHubAnalysis; githubUsername: string }>>("/portfolio/github/connect", {
        githubUsername: githubUsername.trim(),
      });
      setAnalysis(data.data.analysis);
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || "We couldn't analyze that GitHub profile right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer className="relative overflow-hidden">
      <GradientBackground className="opacity-50" />
      <ParticleField count={14} className="opacity-60" />

      <div className="container-page relative z-10 flex flex-col gap-8 py-8">
        <FadeIn className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-foreground-secondary">
            <Github size={13} className="text-accent-cyan" /> GitHub Portfolio Intelligence
          </div>
          <h1 className="text-fluid-2xl font-extrabold tracking-tight">
            Review your <span className="text-gradient">developer portfolio</span>
          </h1>
          <p className="max-w-2xl text-sm text-foreground-secondary sm:text-base">
            Connect a public GitHub profile to get a quick view of portfolio quality, activity, and language spread.
          </p>
        </FadeIn>

        <GlassCard className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold text-foreground">Connect a GitHub profile</h3>
            <p className="text-xs text-foreground-secondary">This uses public GitHub data only and validates the username before analysis.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={githubUsername}
              onChange={(event) => setGithubUsername(event.target.value)}
              placeholder="e.g. octocat"
              className="max-w-xl"
            />
            <Button variant="gradient" onClick={handleConnect} disabled={loading}>
              <Search size={14} /> {loading ? "Analyzing..." : "Analyze profile"}
            </Button>
          </div>
          {error && <ErrorState title="Analysis failed" description={error} onRetry={handleConnect} />}
        </GlassCard>

        {loading && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-40 w-full rounded-2xl" />
            ))}
          </div>
        )}

        {!analysis && !loading && (
          <EmptyState icon={<Sparkles size={22} />} title="No profile analyzed yet" description="Enter a GitHub username to unlock a portfolio scorecard and charts." />
        )}

        {analysis && (
          <FadeIn className="flex flex-col gap-6">
            <AnalyticsCard title="Portfolio Score" subtitle="A high-level snapshot of your developer portfolio quality">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <MetricCard label="Portfolio score" value={analysis.portfolioScore} description="Overall portfolio strength" />
                <MetricCard label="Repo quality" value={analysis.repoQualityScore} description="Signal from public repos and project structure" />
                <MetricCard label="Readme score" value={analysis.readmeScore} description="How well the profile is documented" />
              </div>
            </AnalyticsCard>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <AnalyticsCard title="Contribution activity" subtitle="How active and broad the public profile appears">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <MetricCard label="Commit activity" value={analysis.commitActivity} description="Activity signal for recent contribution behavior" />
                  <MetricCard label="Project diversity" value={analysis.projectDiversity} description="Spread across different project types and languages" />
                </div>
                <p className="mt-4 text-sm text-foreground-secondary">{analysis.contributionSummary}</p>
              </AnalyticsCard>

              <AnalyticsCard title="Language distribution" subtitle="Top languages across non-fork repositories">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartsData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                        {chartsData.map((entry, index) => (
                          <Cell key={`${entry.name}-${index}`} fill={["#8B5CF6", "#22D3EE", "#34D399", "#F59E0B", "#F472B6", "#60A5FA"][index % 6]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </AnalyticsCard>
            </div>

            <AnalyticsCard title="Repository spread" subtitle="A simple breakdown of the most common languages">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </AnalyticsCard>
          </FadeIn>
        )}
      </div>
    </PageContainer>
  );
}
