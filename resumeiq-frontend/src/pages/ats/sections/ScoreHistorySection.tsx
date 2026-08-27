import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { AnalyticsCard } from "@/components/cards/AnalyticsCard";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ScoreHistoryPoint } from "../data";

interface ScoreHistorySectionProps {
  history: ScoreHistoryPoint[];
}

export function ScoreHistorySection({ history }: ScoreHistorySectionProps) {
  if (history.length < 2) {
    return (
      <EmptyState
        title="Not enough history yet"
        description="Upload another version of your resume to see your score trend over time."
      />
    );
  }

  const first = history[0].score;
  const last = history[history.length - 1].score;
  const improvement = last - first;

  return (
    <AnalyticsCard
      title="ATS Score History"
      subtitle={`${improvement >= 0 ? "+" : ""}${improvement} points across ${history.length} analyzed versions`}
    >
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#B3B3B3", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: "#B3B3B3", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone"
              dataKey="score"
              name="ATS Score"
              stroke="#22D3EE"
              strokeWidth={2.5}
              dot={{ fill: "#22D3EE", r: 4 }}
              activeDot={{ r: 6 }}
              animationDuration={900}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsCard>
  );
}
