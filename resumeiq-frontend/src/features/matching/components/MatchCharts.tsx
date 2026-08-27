import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  ResponsiveContainer, Tooltip,
} from "recharts";
import { AnalyticsCard } from "@/components/cards/AnalyticsCard";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import type { MatchRadarPoint, MatchKeywordDistributionPoint } from "@/types";

export function MatchRadarChart({ data }: { data: MatchRadarPoint[] }) {
  return (
    <AnalyticsCard title="Match Radar" subtitle="All scoring categories at a glance">
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "#B3B3B3", fontSize: 10 }} />
            <PolarRadiusAxis tick={{ fill: "#B3B3B3", fontSize: 9 }} axisLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Radar name="Match" dataKey="score" stroke="#22D3EE" fill="#22D3EE" fillOpacity={0.35} animationDuration={900} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsCard>
  );
}

export function KeywordDistributionChart({ data }: { data: MatchKeywordDistributionPoint[] }) {
  return (
    <AnalyticsCard title="Keyword Distribution" subtitle="Matched vs. missing keywords, by category">
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="category" tick={{ fill: "#B3B3B3", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#B3B3B3", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#B3B3B3" }} />
            <Bar dataKey="matched" name="Matched" fill="#10B981" radius={[6, 6, 0, 0]} animationDuration={900} />
            <Bar dataKey="missing" name="Missing" fill="#EC4899" radius={[6, 6, 0, 0]} animationDuration={900} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsCard>
  );
}
