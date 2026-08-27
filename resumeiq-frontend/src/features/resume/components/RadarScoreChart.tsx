import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { AnalyticsCard } from "@/components/cards/AnalyticsCard";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import type { AtsRadarPoint } from "@/types";

export function RadarScoreChart({ data }: { data: AtsRadarPoint[] }) {
  return (
    <AnalyticsCard title="Score Radar" subtitle="All scoring categories at a glance">
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "#B3B3B3", fontSize: 10 }} />
            <PolarRadiusAxis tick={{ fill: "#B3B3B3", fontSize: 9 }} axisLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Radar name="Score" dataKey="score" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.35} animationDuration={900} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsCard>
  );
}
