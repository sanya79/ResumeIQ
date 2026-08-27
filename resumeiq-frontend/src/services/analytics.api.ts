import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./apiClient";
import type { ApiResponse } from "@/types";

export interface DashboardOverview {
  scoreCards: Array<{
    id: string;
    label: string;
    value: number;
    trend: { value: number; direction: "up" | "down" };
    visual: "ring" | "heart" | "bars" | "check";
    description: string;
  }>;
  quickActions: Array<{
    id: string;
    label: string;
    description: string;
    href: string;
    gradient: "primary" | "warm" | "success";
  }>;
  insightGroups: Array<{
    id: string;
    title: string;
    tone: "emerald" | "danger" | "cyan" | "purple";
    items: string[];
  }>;
  recentActivity: Array<{ title: string; description: string; status: "complete" | "current" }>;
  careerProgress: Array<{ label: string; value: number; description: string }>;
  resumeScoreHistory: Array<{ month: string; score: number }>;
  atsTrend: Array<{ month: string; keyword: number; formatting: number; readability: number }>;
  applicationsSent: Array<{ week: string; applications: number }>;
  interviewRate: Array<{ week: string; rate: number }>;
  aiTip: string;
  careerQuote: { quote: string; author: string };
  upcomingInterview: { role: string; company: string; date: string };
}

export async function getAnalyticsOverview(): Promise<DashboardOverview> {
  const { data } = await apiClient.get<ApiResponse<{ overview: DashboardOverview }>>("/analytics/overview");
  return data.data.overview;
}

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: getAnalyticsOverview,
    staleTime: 60 * 1000,
  });
}
