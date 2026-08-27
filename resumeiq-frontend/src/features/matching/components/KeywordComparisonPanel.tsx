import { CheckCircle2, XCircle } from "lucide-react";
import { AnalyticsCard } from "@/components/cards/AnalyticsCard";
import { SkillBadge } from "@/components/cards/SkillBadge";
import { Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";
import { FadeIn } from "@/components/animations/FadeIn";
import { priorityTone } from "@/pages/matching/data";
import type { MatchKeyword } from "@/types";

interface KeywordComparisonPanelProps {
  matched: MatchKeyword[];
  missing: MatchKeyword[];
}

export function KeywordComparisonPanel({ matched, missing }: KeywordComparisonPanelProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <FadeIn>
        <AnalyticsCard
          title="Matched Keywords"
          subtitle={`${matched.length} found in your resume`}
          actions={<CheckCircle2 size={16} className="text-accent-emerald" />}
        >
          {matched.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {matched.map((k) => (
                <Tooltip key={k.term} content={k.reason || `${k.priority} priority`}>
                  <SkillBadge skill={k.term} matched />
                </Tooltip>
              ))}
            </div>
          ) : (
            <p className="text-sm text-foreground-secondary">No matched keywords detected yet.</p>
          )}
        </AnalyticsCard>
      </FadeIn>

      <FadeIn delay={0.1}>
        <AnalyticsCard
          title="Missing Keywords"
          subtitle={`${missing.length} suggested by the AI`}
          actions={<XCircle size={16} className="text-danger" />}
        >
          {missing.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {missing.map((k) => (
                <Tooltip key={k.term} content={k.reason || `${k.priority} priority`}>
                  <span className="inline-flex items-center gap-1.5">
                    <SkillBadge skill={k.term} matched={false} />
                    <Badge tone={priorityTone[k.priority]} className="hidden sm:inline-flex">
                      {k.priority}
                    </Badge>
                  </span>
                </Tooltip>
              ))}
            </div>
          ) : (
            <p className="text-sm text-foreground-secondary">No missing keywords — great keyword coverage.</p>
          )}
        </AnalyticsCard>
      </FadeIn>
    </div>
  );
}
