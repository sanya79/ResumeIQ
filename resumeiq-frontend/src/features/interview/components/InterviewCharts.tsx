import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { AnalyticsCard } from "@/components/cards/AnalyticsCard";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import type { CategoryScore, ConfidenceTimelinePoint, ResponseTimePoint } from "@/types";

const axisTick = { fill: "#B3B3B3", fontSize: 11 };
const gridStroke = "rgba(255,255,255,0.06)";

export function CategoryScoreRadar({ data }: { data: CategoryScore[] }) {
  return (
    <AnalyticsCard title="Category Scores" subtitle="Performance across every question category">
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis dataKey="category" tick={{ fill: "#B3B3B3", fontSize: 10 }} />
            <PolarRadiusAxis tick={{ fill: "#B3B3B3", fontSize: 9 }} axisLine={false} domain={[0, 100]} />
            <Tooltip content={<ChartTooltip />} />
            <Radar name="Score" dataKey="score" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.35} animationDuration={900} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsCard>
  );
}

export function ConfidenceTimelineChart({ data }: { data: ConfidenceTimelinePoint[] }) {
  return (
    <AnalyticsCard title="Confidence Timeline" subtitle="Confidence score across the session">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid stroke={gridStroke} vertical={false} />
            <XAxis dataKey="questionIndex" tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => `Q${v + 1}`} />
            <YAxis domain={[0, 100]} tick={axisTick} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="confidenceScore" name="Confidence" stroke="#EC4899" strokeWidth={2.5} dot animationDuration={900} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsCard>
  );
}

export function ResponseTimeChart({ data }: { data: ResponseTimePoint[] }) {
  return (
    <AnalyticsCard title="Response Time" subtitle="Actual vs. estimated answer time, per question">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid stroke={gridStroke} vertical={false} />
            <XAxis dataKey="questionIndex" tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => `Q${v + 1}`} />
            <YAxis tick={axisTick} axisLine={false} tickLine={false} unit="s" />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="seconds" name="Actual (s)" fill="#3B82F6" radius={[6, 6, 0, 0]} animationDuration={900} />
            <Bar dataKey="estimatedSeconds" name="Estimated (s)" fill="rgba(255,255,255,0.15)" radius={[6, 6, 0, 0]} animationDuration={900} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsCard>
  );
}
