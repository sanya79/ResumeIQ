import { useMemo, useState } from "react";
import { Github, Sparkles, Search, Code2, FolderGit2, Star, GitFork, ExternalLink } from "lucide-react";
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
import { Badge } from "@/components/ui/Badge";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { apiClient } from "@/services/apiClient";
import type { ApiResponse } from "@/types";

interface GitHubRepository {
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  url: string;
  updatedAt: string;
}

interface GitHubAnalysis {
  repoQualityScore: number;
  readmeScore: number;
  commitActivity: number;
  languageDistribution: Array<{ name: string; value: number }>;
  projectDiversity: number;
  contributionSummary: string;
  portfolioScore: number;
  repositories?: GitHubRepository[];
}

export function GitHubPortfolioPage() {
  const [githubUsername, setGithubUsername] = useState("");
  const [analysis, setAnalysis] = useState<GitHubAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chartsData = useMemo(() => analysis?.languageDistribution ?? [], [analysis]);
  const repositories = useMemo(() => analysis?.repositories ?? [], [analysis]);

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
            Connect a public GitHub profile to get a detailed view of repositories, portfolio quality, activity, and language spread.
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
              onKeyDown={(e) => e.key === "Enter" && handleConnect()}
              placeholder="e.g. sanya79"
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
          <EmptyState icon={<Sparkles size={22} />} title="No profile analyzed yet" description="Enter a GitHub username to unlock a portfolio scorecard, repositories list, and language charts." />
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

            {/* Repositories Catalog Grid */}
            <GlassCard className="flex flex-col gap-5 p-6 border border-white/15">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <FolderGit2 size={20} className="text-accent-purple" />
                  <div>
                    <h3 className="font-bold text-foreground">Public Repositories ({repositories.length})</h3>
                    <p className="text-xs text-foreground-secondary">Detailed list of analyzed public code repositories</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {repositories.map((repo, idx) => (
                  <div key={idx} className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-accent-purple/40 hover:bg-white/[0.06] transition-all group">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5 group-hover:text-accent-cyan transition-colors truncate">
                          <FolderGit2 size={14} className="shrink-0 text-accent-purple" /> {repo.name}
                        </h4>
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-foreground-secondary hover:text-foreground p-1 transition-colors"
                          title="Open on GitHub"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                      <p className="text-xs text-foreground-secondary line-clamp-2 leading-relaxed">
                        {repo.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-foreground-secondary">
                      <Badge tone="purple" className="text-[10px] font-semibold">{repo.language}</Badge>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-amber-400 font-semibold"><Star size={12} /> {repo.stars}</span>
                        <span className="flex items-center gap-1 text-accent-cyan font-semibold"><GitFork size={12} /> {repo.forks}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <AnalyticsCard title="Contribution activity" subtitle="How active and broad the public profile appears">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <MetricCard label="Commit activity" value={analysis.commitActivity} description="Activity signal for recent contribution behavior" />
                  <MetricCard label="Project diversity" value={analysis.projectDiversity} description="Spread across different project types and languages" />
                </div>
                <p className="mt-4 text-sm text-foreground-secondary">{analysis.contributionSummary}</p>
              </AnalyticsCard>

              <AnalyticsCard title="Language distribution" subtitle="Top languages across non-fork repositories">
                <div className="h-72 flex items-center justify-center">
                  {chartsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartsData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                          {chartsData.map((entry, index) => (
                            <Cell key={`${entry.name}-${index}`} fill={["#8B5CF6", "#22D3EE", "#34D399", "#F59E0B", "#F472B6", "#60A5FA"][index % 6]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", color: "#F8FAFC" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-center p-6 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                      <Code2 size={32} className="text-foreground-secondary/50" />
                      <p className="text-sm font-semibold text-foreground">No language data available</p>
                      <p className="text-xs text-foreground-secondary max-w-xs">
                        Public repositories with tagged code languages will appear here once pushed to GitHub.
                      </p>
                    </div>
                  )}
                </div>
              </AnalyticsCard>
            </div>

            <AnalyticsCard title="Repository spread" subtitle="A simple breakdown of the most common languages">
              <div className="h-72 flex items-center justify-center">
                {chartsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                      <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", color: "#F8FAFC" }} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 text-center p-6 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                    <FolderGit2 size={32} className="text-foreground-secondary/50" />
                    <p className="text-sm font-semibold text-foreground">No repository spread available</p>
                    <p className="text-xs text-foreground-secondary max-w-xs">
                      Public non-forked repositories will show language distribution breakdown here.
                    </p>
                  </div>
                )}
              </div>
            </AnalyticsCard>
          </FadeIn>
        )}
      </div>
    </PageContainer>
  );
}

export default GitHubPortfolioPage;
