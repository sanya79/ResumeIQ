import { useMemo, useState } from "react";
import { Sparkles, Search, Trophy, Calendar, Bell, Clock, Code2, ExternalLink, CheckCircle2 } from "lucide-react";
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
import { useToast } from "@/hooks/useToast";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { apiClient } from "@/services/apiClient";
import type { ApiResponse } from "@/types";

interface LanguageSolved {
  name: string;
  count: number;
  percentage: number;
}

interface UpcomingContest {
  title: string;
  dateText: string;
  timeText: string;
  timeRemainingText: string;
  duration: string;
  registrationUrl: string;
}

interface LeetCodeAnalysis {
  username: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number;
  reputation: number;
  acceptanceRate: number;
  leetcodeScore: number;
  contestsAttended: number;
  contestRating: number;
  globalContestRank: string;
  badgeTitle: string;
  problemDifficultyDistribution: Array<{ name: string; value: number }>;
  topicDistribution: Array<{ name: string; value: number }>;
  languages: LanguageSolved[];
  upcomingContest: UpcomingContest;
  summary: string;
}

export function LeetCodePortfolioPage() {
  const toast = useToast();
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [analysis, setAnalysis] = useState<LeetCodeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reminderSet, setReminderSet] = useState(false);

  const difficultyData = useMemo(() => analysis?.problemDifficultyDistribution ?? [], [analysis]);
  const topicData = useMemo(() => analysis?.topicDistribution ?? [], [analysis]);
  const languages = useMemo(() => analysis?.languages ?? [], [analysis]);

  async function handleConnect() {
    if (!leetcodeUsername.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const { data } = await apiClient.post<ApiResponse<{ analysis: LeetCodeAnalysis; leetcodeUsername: string }>>("/portfolio/leetcode/connect", {
        leetcodeUsername: leetcodeUsername.trim(),
      });
      setAnalysis(data.data.analysis);
      setReminderSet(false);
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || "We couldn't analyze that LeetCode profile right now.");
    } finally {
      setLoading(false);
    }
  }

  function handleSetReminder() {
    setReminderSet(true);
    toast.success(
      "Contest Reminder Saved!",
      `We will notify you before ${analysis?.upcomingContest?.title || "the next LeetCode contest"} starts.`
    );
  }

  return (
    <PageContainer className="relative overflow-hidden">
      <GradientBackground className="opacity-50" />
      <ParticleField count={16} className="opacity-60" />

      <div className="container-page relative z-10 flex flex-col gap-8 py-8">
        <FadeIn className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-foreground-secondary">
            <Trophy size={14} className="text-amber-400" /> LeetCode Portfolio & Contest Intelligence
          </div>
          <h1 className="text-fluid-2xl font-extrabold tracking-tight">
            Analyze your <span className="text-gradient">LeetCode & contest benchmarks</span>
          </h1>
          <p className="max-w-2xl text-sm text-foreground-secondary sm:text-base">
            Connect a public LeetCode profile to evaluate contest ratings, language-wise problem counts, and upcoming contest reminders.
          </p>
        </FadeIn>

        <GlassCard className="flex flex-col gap-4 border border-white/15 p-6 shadow-2xl">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold text-foreground">Connect a LeetCode Profile</h3>
            <p className="text-xs text-foreground-secondary">Enter any public LeetCode handle (e.g. alex_dev, sanya79) to extract problem metrics.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={leetcodeUsername}
              onChange={(event) => setLeetcodeUsername(event.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConnect()}
              placeholder="e.g. alex_dev"
              className="max-w-xl"
            />
            <Button variant="gradient" onClick={handleConnect} disabled={loading}>
              <Search size={14} /> {loading ? "Analyzing..." : "Analyze LeetCode Profile"}
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
          <EmptyState icon={<Trophy size={26} className="text-amber-400" />} title="No LeetCode profile connected" description="Enter your LeetCode handle above to unlock algorithmic scorecards, contest rating, language counts, and contest reminders." />
        )}

        {analysis && (
          <FadeIn className="flex flex-col gap-6">
            {/* Scorecard Hero Bar */}
            <AnalyticsCard title="LeetCode Competitive Scorecard" subtitle={`Analysis for @${analysis.username}`}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                <MetricCard label="LeetCode Rating Score" value={analysis.leetcodeScore} description="Algorithmic rating score" />
                <MetricCard label="Total Solved Ratio" value={Math.min(100, Math.round((analysis.totalSolved / 400) * 100))} description={`${analysis.totalSolved} total benchmarks`} />
                <GlassCard className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-foreground">Global Ranking</span>
                  <span className="text-2xl font-extrabold text-gradient">#{analysis.ranking.toLocaleString()}</span>
                  <p className="text-xs text-foreground-secondary">Worldwide rank percentile</p>
                </GlassCard>
                <GlassCard className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-foreground">Acceptance Rate</span>
                  <span className="text-2xl font-extrabold text-accent-cyan">{analysis.acceptanceRate}%</span>
                  <p className="text-xs text-foreground-secondary">Accepted submissions ratio</p>
                </GlassCard>
              </div>
            </AnalyticsCard>

            {/* Contest Stats & Upcoming Contest Reminder Row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Contest Statistics Card */}
              <GlassCard className="flex flex-col gap-5 p-6 border border-white/15">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <Trophy size={20} className="text-amber-400" />
                    <div>
                      <h3 className="font-bold text-foreground">Contest Performance & Rating</h3>
                      <p className="text-xs text-foreground-secondary">Official LeetCode competitive rating stats</p>
                    </div>
                  </div>
                  <Badge tone="purple" className="px-3 py-1 font-bold text-xs uppercase tracking-wider">
                    🛡️ {analysis.badgeTitle}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                    <span className="text-[11px] text-foreground-secondary uppercase tracking-wider block">Contests Attended</span>
                    <span className="text-2xl font-extrabold text-amber-400">{analysis.contestsAttended}</span>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                    <span className="text-[11px] text-foreground-secondary uppercase tracking-wider block">Contest Rating</span>
                    <span className="text-2xl font-extrabold text-accent-cyan">{analysis.contestRating}</span>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                    <span className="text-[11px] text-foreground-secondary uppercase tracking-wider block">Contest Rank</span>
                    <span className="text-xl font-extrabold text-emerald-400">{analysis.globalContestRank}</span>
                  </div>
                </div>
              </GlassCard>

              {/* Upcoming Contest Reminder Card */}
              <GlassCard className="flex flex-col gap-5 p-6 border border-amber-500/30 bg-gradient-to-r from-amber-950/20 to-slate-900/90">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <Calendar size={20} className="text-amber-400 animate-pulse" />
                    <div>
                      <h3 className="font-bold text-foreground">Upcoming LeetCode Contest</h3>
                      <p className="text-xs text-foreground-secondary">Live competitive programming round</p>
                    </div>
                  </div>
                  <Badge tone="purple">Next Contest</Badge>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground">{analysis.upcomingContest.title}</span>
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Clock size={13} /> {analysis.upcomingContest.duration}
                    </span>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 space-y-1.5">
                    <p className="text-foreground flex items-center gap-2">
                      <Calendar size={14} className="text-accent-cyan" /> {analysis.upcomingContest.dateText} — {analysis.upcomingContest.timeText}
                    </p>
                    <p className="text-amber-400 font-semibold flex items-center gap-1.5 text-xs">
                      <Bell size={13} /> Countdown: {analysis.upcomingContest.timeRemainingText}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <Button
                      variant={reminderSet ? "secondary" : "gradient"}
                      size="sm"
                      onClick={handleSetReminder}
                      className="flex-1"
                    >
                      {reminderSet ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Bell size={14} />}
                      {reminderSet ? "Reminder Set ✓" : "Set Contest Reminder"}
                    </Button>
                    <a
                      href={analysis.upcomingContest.registrationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-foreground hover:bg-white/10 transition-colors"
                    >
                      Register <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Language Solved Breakdown Section */}
            <GlassCard className="flex flex-col gap-5 p-6 border border-white/15">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <Code2 size={20} className="text-accent-cyan" />
                  <div>
                    <h3 className="font-bold text-foreground">Language-wise Solved Breakdown</h3>
                    <p className="text-xs text-foreground-secondary">Solved questions count categorized by programming language</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {languages.map((lang, idx) => (
                  <div key={idx} className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-foreground">{lang.name}</span>
                      <span className="text-accent-cyan font-bold">{lang.count} Solved</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full bg-gradient-primary rounded-full"
                        style={{ width: `${lang.percentage}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-foreground-secondary text-right">{lang.percentage}% of total</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Difficulty & Topic Charts */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <AnalyticsCard title="Problem Difficulty Spread" subtitle="Easy, Medium, and Hard problem benchmarks">
                <div className="h-72 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={difficultyData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3}>
                        <Cell fill="#34D399" />
                        <Cell fill="#F59E0B" />
                        <Cell fill="#F43F5E" />
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", color: "#F8FAFC" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 flex justify-center gap-6 text-xs font-semibold">
                  <span className="text-emerald-400 flex items-center gap-1.5">● Easy ({analysis.easySolved})</span>
                  <span className="text-amber-400 flex items-center gap-1.5">● Medium ({analysis.mediumSolved})</span>
                  <span className="text-rose-400 flex items-center gap-1.5">● Hard ({analysis.hardSolved})</span>
                </div>
              </AnalyticsCard>

              <AnalyticsCard title="Topic & Algorithmic Domain Spread" subtitle="Key problem topics solved on LeetCode">
                <div className="h-72 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topicData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", color: "#F8FAFC" }} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#22D3EE" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </AnalyticsCard>
            </div>

            <GlassCard className="p-6 border border-white/15">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
                <Sparkles size={16} className="text-accent-cyan" /> Profile Evaluation & Insights
              </div>
              <p className="text-sm text-foreground-secondary leading-relaxed">{analysis.summary}</p>
            </GlassCard>
          </FadeIn>
        )}
      </div>
    </PageContainer>
  );
}

export default LeetCodePortfolioPage;
