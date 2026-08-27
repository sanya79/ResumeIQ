import { AlertTriangle, AlertOctagon, Info, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { HoverLift } from "@/components/animations/HoverLift";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import { getBreakdownPercentage, getSeverity, type ProblemSeverity } from "../data";
import type { AtsScorecard } from "@/types";

const severityConfig: Record<
  ProblemSeverity,
  { icon: typeof AlertOctagon; tone: "danger" | "pink" | "neutral"; iconClass: string }
> = {
  Critical: { icon: AlertOctagon, tone: "danger", iconClass: "text-danger" },
  Warning: { icon: AlertTriangle, tone: "pink", iconClass: "text-accent-pink" },
  Minor: { icon: Info, tone: "neutral", iconClass: "text-foreground-secondary" },
};

interface AtsProblemsSectionProps {
  scorecard: AtsScorecard;
}

export function AtsProblemsSection({ scorecard }: AtsProblemsSectionProps) {
  if (scorecard.weakAreas.length === 0) {
    return <EmptyState title="No ATS issues detected" description="This resume didn't trigger any weak-area flags." />;
  }

  return (
    <StaggerChildren>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {scorecard.weakAreas.map((weakness) => {
          const relatedItem = scorecard.breakdown.find((b) => b.id === weakness.id || b.name === weakness.name);
          const percentage = relatedItem ? getBreakdownPercentage(relatedItem) : null;
          const severity = getSeverity(percentage);
          const { icon: Icon, tone, iconClass } = severityConfig[severity];

          return (
            <StaggerItem key={weakness.id}>
              <HoverLift>
                <GlassCard className="flex h-full flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`inline-flex rounded-xl bg-white/[0.05] p-2.5 ${iconClass}`}>
                      <Icon size={17} />
                    </span>
                    <Badge tone={tone}>{severity}</Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{weakness.name}</h3>
                    <p className="mt-1 text-xs text-foreground-secondary">{weakness.message}</p>
                  </div>
                  {relatedItem && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-auto justify-start px-0"
                      onClick={() => document.getElementById(`section-${relatedItem.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })}
                    >
                      View details <ArrowRight size={13} />
                    </Button>
                  )}
                </GlassCard>
              </HoverLift>
            </StaggerItem>
          );
        })}
      </div>
    </StaggerChildren>
  );
}
