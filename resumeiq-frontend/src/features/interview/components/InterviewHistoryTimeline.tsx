import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { History } from "lucide-react";
import { AnalyticsCard } from "@/components/cards/AnalyticsCard";
import { TimelineCard, type TimelineStep } from "@/components/cards/TimelineCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import type { InterviewHistoryEntry } from "@/types";

const resultToStatus: Record<InterviewHistoryEntry["result"], TimelineStep["status"]> = {
  "Strong Pass": "complete",
  Pass: "complete",
  "Needs Improvement": "current",
};

export function InterviewHistoryTimeline({ history }: { history: InterviewHistoryEntry[] }) {
  if (history.length === 0) {
    return (
      <AnalyticsCard title="Interview History" actions={<History size={16} className="text-accent-cyan" />}>
        <EmptyState title="No past sessions yet" description="Completed interviews will show up here." />
      </AnalyticsCard>
    );
  }

  const steps: TimelineStep[] = history.map((entry) => ({
    title: `${entry.targetRole} · ${entry.difficulty}`,
    description: `${new Date(entry.date).toLocaleDateString()} · Scored ${Math.round(entry.overallScore)}/100 · ${Math.round(
      entry.timeTakenSeconds / 60
    )} min · ${entry.result}`,
    status: resultToStatus[entry.result],
  }));

  // "Performance Trend" over time — real historical scores, oldest first.
  const trendData = [...history].reverse().map((entry, i) => ({
    session: `#${i + 1}`,
    score: Math.round(entry.overallScore),
  }));

  return (
    <AnalyticsCard title="Interview History" actions={<History size={16} className="text-accent-cyan" />}>
      <div className="mb-6 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="session" tick={{ fill: "#B3B3B3", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: "#B3B3B3", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="score" name="Score" stroke="#10B981" strokeWidth={2.5} dot animationDuration={900} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <TimelineCard steps={steps} />
    </AnalyticsCard>
  );
}
