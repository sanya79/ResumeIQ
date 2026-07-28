import { FileText, Clock, History } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { formatFileSize } from "../validation";
import type { Resume } from "@/types";

const statusTone: Record<Resume["status"], "purple" | "cyan" | "emerald" | "danger" | "neutral"> = {
  Uploaded: "cyan",
  Queued: "cyan",
  Parsing: "purple",
  Analyzing: "purple",
  Completed: "emerald",
  Failed: "danger",
  Archived: "neutral",
};

export function ResumeMetaCard({ resume }: { resume: Resume }) {
  return (
    <GlassCard className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <FileText size={16} className="shrink-0 text-accent-cyan" />
          <span className="truncate text-sm font-medium text-foreground">{resume.originalName}</span>
        </div>
        <Badge tone={statusTone[resume.status]}>{resume.status}</Badge>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-foreground-secondary">
        <div className="flex items-center gap-1.5">
          <History size={12} /> Version {resume.version}
        </div>
        <div>{formatFileSize(resume.fileSize)}</div>
        <div className="col-span-2 flex items-center gap-1.5">
          <Clock size={12} /> Uploaded {new Date(resume.createdAt).toLocaleString()}
        </div>
      </dl>
    </GlassCard>
  );
}
