import { TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { SlideUp } from "@/components/animations/SlideUp";
import { AnalyticsCard } from "@/components/cards/AnalyticsCard";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { resumeScoreHistory, atsTrend, applicationsSent, interviewRate } from "../data";

const axisTick = { fill: "#B3B3B3", fontSize: 11 };
const gridStroke = "rgba(255,255,255,0.06)";

export function PerformanceChartsSection() {
  return (
    <SlideUp>
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp size={18} className="text-accent-cyan" />
        <h2 className="text-fluid-lg font-semibold">Performance</h2>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <AnalyticsCard title="Resume Score History" subtitle="Overall ATS score over time">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={resumeScoreHistory} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="resumeScoreFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={gridStroke} vertical={false} />
                <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  name="Score"
                  stroke="#8B5CF6"
                  strokeWidth={2.5}
                  fill="url(#resumeScoreFill)"
                  animationDuration={900}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsCard>

        <AnalyticsCard title="ATS Trend" subtitle="Keyword, formatting & readability over time">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={atsTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke={gridStroke} vertical={false} />
                <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="keyword" name="Keyword" stroke="#22D3EE" strokeWidth={2.25} dot={false} animationDuration={900} />
                <Line type="monotone" dataKey="formatting" name="Formatting" stroke="#3B82F6" strokeWidth={2.25} dot={false} animationDuration={900} />
                <Line type="monotone" dataKey="readability" name="Readability" stroke="#EC4899" strokeWidth={2.25} dot={false} animationDuration={900} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsCard>

        <AnalyticsCard title="Applications Sent" subtitle="Per week, last 6 weeks">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={applicationsSent} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke={gridStroke} vertical={false} />
                <XAxis dataKey="week" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="applications" name="Applications" fill="#3B82F6" radius={[6, 6, 0, 0]} animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsCard>

        <AnalyticsCard title="Interview Rate" subtitle="% of applications leading to an interview">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={interviewRate} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="interviewRateFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={gridStroke} vertical={false} />
                <XAxis dataKey="week" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} unit="%" />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="rate"
                  name="Interview rate"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fill="url(#interviewRateFill)"
                  animationDuration={900}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsCard>
      </div>
    </SlideUp>
  );
}
