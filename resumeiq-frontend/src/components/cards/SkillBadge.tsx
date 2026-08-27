import { Check, X } from "lucide-react";
import { cn } from "@/utils/cn";

interface SkillBadgeProps {
  skill: string;
  matched?: boolean; // true = present/matched, false = missing, undefined = neutral
}

/** Skill pill used inside ATS/match results — colors itself green when the
 * skill is matched, red when missing, neutral otherwise. */
export function SkillBadge({ skill, matched }: SkillBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        matched === true && "bg-accent-emerald/10 border-accent-emerald/25 text-accent-emerald",
        matched === false && "bg-danger/10 border-danger/25 text-danger",
        matched === undefined && "bg-white/[0.05] border-surface-border text-foreground-secondary"
      )}
    >
      {matched === true && <Check size={11} />}
      {matched === false && <X size={11} />}
      {skill}
    </span>
  );
}
