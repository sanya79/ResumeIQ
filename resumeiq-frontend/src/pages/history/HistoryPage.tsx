import { useState, useMemo } from "react";
import { History, FileText, MessagesSquare, ArrowUpRight, Trash2 } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { GradientBackground } from "@/components/animations/GradientBackground";
import { ParticleField } from "@/components/animations/ParticleField";
import { FadeIn } from "@/components/animations/FadeIn";
import { GlassCard } from "@/components/cards/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useResumeHistory, useDeleteResume } from "@/features/resume/hooks";
import { useInterviewHistory } from "@/features/interview/hooks";
import { useToast } from "@/hooks/useToast";

type FilterCategory = "all" | "resumes" | "interviews";

export function HistoryPage() {
  const toast = useToast();
  const [filter, setFilter] = useState<FilterCategory>("all");
  const { data: resumeHistory = [], isLoading: isResumeLoading, refetch: refetchResumes } = useResumeHistory();
  const { data: interviewHistory = [], isLoading: isInterviewLoading } = useInterviewHistory();
  const deleteResumeMutation = useDeleteResume();

  const isLoading = isResumeLoading || isInterviewLoading;

  const combinedHistory = useMemo(() => {
    const items: Array<{
      id: string;
      type: "resume" | "interview";
      title: string;
      subtitle: string;
      score: number;
      date: string;
      rawDate: Date;
      detailsUrl: string;
    }> = [];

    resumeHistory.forEach((r) => {
      items.push({
        id: r._id,
        type: "resume",
        title: r.originalName || `Resume Version ${r.version}`,
        subtitle: `Version ${r.version} · Status: ${r.status}`,
        score: r.atsScorecard?.overallScore ?? 0,
        date: new Date(r.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        rawDate: new Date(r.createdAt),
        detailsUrl: `/ats/${r._id}`,
      });
    });

    interviewHistory.forEach((i) => {
      items.push({
        id: i.id,
        type: "interview",
        title: `${i.targetRole} (${i.difficulty})`,
        subtitle: `Mock Interview · ${i.result}`,
        score: i.overallScore,
        date: i.date,
        rawDate: new Date(i.date),
        detailsUrl: "/interview",
      });
    });

    return items.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
  }, [resumeHistory, interviewHistory]);

  const filteredItems = useMemo(() => {
    if (filter === "resumes") return combinedHistory.filter((i) => i.type === "resume");
    if (filter === "interviews") return combinedHistory.filter((i) => i.type === "interview");
    return combinedHistory;
  }, [combinedHistory, filter]);

  function handleDeleteResume(id: string) {
    deleteResumeMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Resume deleted", "The selected resume was removed from history.");
        refetchResumes();
      },
      onError: () => {
        toast.error("Delete failed", "Couldn't delete the resume version.");
      },
    });
  }

  return (
    <PageContainer className="relative overflow-hidden">
      <GradientBackground className="opacity-50" />
      <ParticleField count={16} className="opacity-60" />

      <div className="container-page relative z-10 flex flex-col gap-8 py-8">
        <FadeIn className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-foreground-secondary">
            <History size={14} className="text-accent-cyan" /> Complete Activity Audit
          </div>
          <h1 className="text-fluid-2xl font-extrabold tracking-tight">
            Activity & Version <span className="text-gradient">History</span>
          </h1>
          <p className="max-w-2xl text-sm text-foreground-secondary sm:text-base">
            Review past uploaded resume versions, ATS analyses, job matches, and mock interview practice sessions.
          </p>
        </FadeIn>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex rounded-xl border border-surface-border bg-background-secondary/70 p-1">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${
                filter === "all" ? "bg-accent-purple text-white shadow-glow-sm" : "text-foreground-secondary hover:text-foreground"
              }`}
            >
              All Activity ({combinedHistory.length})
            </button>
            <button
              onClick={() => setFilter("resumes")}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${
                filter === "resumes" ? "bg-accent-purple text-white shadow-glow-sm" : "text-foreground-secondary hover:text-foreground"
              }`}
            >
              Resumes ({resumeHistory.length})
            </button>
            <button
              onClick={() => setFilter("interviews")}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${
                filter === "interviews" ? "bg-accent-purple text-white shadow-glow-sm" : "text-foreground-secondary hover:text-foreground"
              }`}
            >
              Interviews ({interviewHistory.length})
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        )}

        {!isLoading && filteredItems.length === 0 && (
          <EmptyState
            icon={<History size={24} />}
            title="No activity history found"
            description="Upload a resume or run an interview session to start building your timeline."
          />
        )}

        {!isLoading && filteredItems.length > 0 && (
          <FadeIn className="flex flex-col gap-4">
            {filteredItems.map((item) => (
              <GlassCard key={`${item.type}-${item.id}`} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-5 hover:border-surface-border/90 transition-all">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                      item.type === "resume" ? "bg-accent-purple/10 text-accent-purple" : "bg-accent-cyan/10 text-accent-cyan"
                    }`}
                  >
                    {item.type === "resume" ? <FileText size={22} /> : <MessagesSquare size={22} />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <Badge tone={item.type === "resume" ? "purple" : "cyan"}>
                        {item.type === "resume" ? "Resume" : "Interview"}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-foreground-secondary">{item.subtitle}</p>
                    <p className="mt-1 text-[11px] text-foreground-tertiary">{item.date}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  {item.score > 0 && (
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-foreground-secondary">Rating Score</span>
                      <span className="text-lg font-bold text-gradient">{item.score}/100</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => (window.location.href = item.detailsUrl)}>
                      View <ArrowUpRight size={14} />
                    </Button>
                    {item.type === "resume" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteResume(item.id)}
                        disabled={deleteResumeMutation.isPending}
                        className="text-danger hover:bg-danger/10 hover:text-danger"
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </FadeIn>
        )}
      </div>
    </PageContainer>
  );
}

export default HistoryPage;
