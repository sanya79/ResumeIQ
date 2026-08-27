import { lazy, Suspense } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { GradientBackground } from "@/components/animations/GradientBackground";
import { ParticleField } from "@/components/animations/ParticleField";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/utils/cn";
import { useAnalyticsOverview } from "@/services/analytics.api";
import { WelcomeSection } from "./sections/WelcomeSection";
import { AnalyticsGridSection } from "./sections/AnalyticsGridSection";
import { RightRailSection } from "./sections/RightRailSection";

// Below-the-fold sections are code-split, same pattern as the landing
// page, so the first paint (welcome + analytics grid) ships lean and the
// rest streams in as it scrolls into view.
const QuickActionsSection = lazy(() =>
  import("./sections/QuickActionsSection").then((m) => ({ default: m.QuickActionsSection }))
);
const AiInsightsSection = lazy(() =>
  import("./sections/AiInsightsSection").then((m) => ({ default: m.AiInsightsSection }))
);
const PerformanceChartsSection = lazy(() =>
  import("./sections/PerformanceChartsSection").then((m) => ({ default: m.PerformanceChartsSection }))
);
const CareerProgressSection = lazy(() =>
  import("./sections/CareerProgressSection").then((m) => ({ default: m.CareerProgressSection }))
);
const RecentActivitySection = lazy(() =>
  import("./sections/RecentActivitySection").then((m) => ({ default: m.RecentActivitySection }))
);

// Tailwind can't resolve a dynamically-interpolated class string at build
// time, so fallback heights are pinned to this static lookup rather than
// an arbitrary-value template literal.
const fallbackHeights = {
  sm: "h-[180px]",
  md: "h-[240px]",
  lg: "h-[320px]",
  xl: "h-[360px]",
  "2xl": "h-[620px]",
} as const;

function SectionFallback({ size = "md" }: { size?: keyof typeof fallbackHeights }) {
  return <Skeleton className={cn("w-full rounded-2xl", fallbackHeights[size])} />;
}

export function DashboardPage() {
  const { data: overview, isLoading } = useAnalyticsOverview();

  return (
    <PageContainer className="relative overflow-hidden">
      <GradientBackground className="opacity-60" />
      <ParticleField count={18} className="opacity-70" />

      <div className="container-page relative z-10 flex flex-col gap-10 py-8">
        <WelcomeSection />
        <AnalyticsGridSection data={overview ?? undefined} isLoading={isLoading} />

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-10">
            <Suspense fallback={<SectionFallback size="sm" />}>
              <QuickActionsSection data={overview?.quickActions ?? []} isLoading={isLoading} />
            </Suspense>

            <Suspense fallback={<SectionFallback size="lg" />}>
              <AiInsightsSection data={overview?.insightGroups ?? []} isLoading={isLoading} />
            </Suspense>

            <Suspense fallback={<SectionFallback size="2xl" />}>
              <PerformanceChartsSection
                data={{
                  resumeScoreHistory: overview?.resumeScoreHistory ?? [],
                  atsTrend: overview?.atsTrend ?? [],
                  applicationsSent: overview?.applicationsSent ?? [],
                  interviewRate: overview?.interviewRate ?? [],
                }}
                isLoading={isLoading}
              />
            </Suspense>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <Suspense fallback={<SectionFallback size="xl" />}>
                <CareerProgressSection data={overview?.careerProgress ?? []} isLoading={isLoading} />
              </Suspense>
              <Suspense fallback={<SectionFallback size="xl" />}>
                <RecentActivitySection data={overview?.recentActivity ?? []} isLoading={isLoading} />
              </Suspense>
            </div>
          </div>

          <aside className="xl:sticky xl:top-24 xl:self-start">
            <RightRailSection
              data={{
                aiTip: overview?.aiTip ?? "",
                careerQuote: overview?.careerQuote ?? { quote: "", author: "" },
                upcomingInterview: overview?.upcomingInterview ?? { role: "", company: "", date: "" },
              }}
              isLoading={isLoading}
            />
          </aside>
        </div>
      </div>
    </PageContainer>
  );
}
