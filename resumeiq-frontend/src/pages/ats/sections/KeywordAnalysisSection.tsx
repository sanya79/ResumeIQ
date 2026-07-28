import { CheckCircle2, XCircle } from "lucide-react";
import { AnalyticsCard } from "@/components/cards/AnalyticsCard";
import { SkillBadge } from "@/components/cards/SkillBadge";
import { Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";
import { EmptyState } from "@/components/ui/EmptyState";
import { FadeIn } from "@/components/animations/FadeIn";
import { findKeywordBreakdownItem, toDerivedKeywords, type KeywordImportance } from "../data";
import type { AtsBreakdownItem } from "@/types";

const importanceTone: Record<KeywordImportance, "purple" | "cyan" | "neutral"> = {
  High: "purple",
  Medium: "cyan",
  Low: "neutral",
};

interface KeywordAnalysisSectionProps {
  breakdown: AtsBreakdownItem[];
}

export function KeywordAnalysisSection({ breakdown }: KeywordAnalysisSectionProps) {
  const keywordItem = findKeywordBreakdownItem(breakdown);

  if (!keywordItem) {
    return (
      <EmptyState
        title="No keyword analysis available"
        description="This resume's scorecard didn't include a keyword-relevance breakdown."
      />
    );
  }

  const matched = toDerivedKeywords(keywordItem.evidence);
  const missing = toDerivedKeywords(keywordItem.suggestions);

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
                <Tooltip key={k.term} content={`${k.importance} importance`}>
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
                <Tooltip key={k.term} content={`${k.importance} importance`}>
                  <span className="inline-flex items-center gap-1.5">
                    <SkillBadge skill={k.term} matched={false} />
                    <Badge tone={importanceTone[k.importance]} className="hidden sm:inline-flex">
                      {k.importance}
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
