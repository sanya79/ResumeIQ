import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Lightbulb, Bookmark, Share2, Play } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { HoverLift } from "@/components/animations/HoverLift";
import { StaggerChildren, StaggerItem } from "@/components/animations/StaggerChildren";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { useToast } from "@/hooks/useToast";
import type { InterviewQuestion, InterviewDifficulty } from "@/types";

const difficultyTone: Record<InterviewDifficulty, "emerald" | "cyan" | "purple" | "danger"> = {
  Easy: "emerald",
  Medium: "cyan",
  Hard: "purple",
  Expert: "danger",
};

function QuestionCard({ question }: { question: InterviewQuestion }) {
  const [hintOpen, setHintOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const toast = useToast();

  function handleShare() {
    navigator.clipboard?.writeText(question.prompt);
    toast.info("Copied", "Question copied to clipboard.");
  }

  function handleToggleSave() {
    setSaved((s) => !s);
    toast.info(saved ? "Removed" : "Saved", saved ? "Question removed from your saved list." : "Question saved for later.");
  }

  return (
    <HoverLift>
      <GlassCard className="flex h-full flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <Badge tone={difficultyTone[question.difficulty]}>{question.difficulty}</Badge>
          <span className="inline-flex items-center gap-1 text-xs text-foreground-secondary">
            <Clock size={12} /> ~{Math.round(question.estimatedAnswerSeconds / 60)} min
          </span>
        </div>

        <p className="text-sm font-medium leading-relaxed text-foreground">{question.prompt}</p>
        <span className="text-xs text-foreground-secondary">{question.category}</span>

        {hintOpen && question.hint && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-lg bg-white/[0.04] px-3 py-2 text-xs text-foreground-secondary"
          >
            💡 {question.hint}
          </motion.p>
        )}

        <div className="mt-auto flex items-center gap-1 pt-1">
          <Tooltip content="Hint">
            <button
              type="button"
              onClick={() => setHintOpen((o) => !o)}
              className="rounded-lg p-2 text-foreground-secondary transition-colors hover:bg-white/[0.06] hover:text-accent-cyan"
            >
              <Lightbulb size={15} />
            </button>
          </Tooltip>
          <Tooltip content={saved ? "Saved" : "Save question"}>
            <button
              type="button"
              onClick={handleToggleSave}
              className="rounded-lg p-2 text-foreground-secondary transition-colors hover:bg-white/[0.06] hover:text-accent-purple"
            >
              <Bookmark size={15} className={saved ? "fill-accent-purple text-accent-purple" : undefined} />
            </button>
          </Tooltip>
          <Tooltip content="Share">
            <button
              type="button"
              onClick={handleShare}
              className="rounded-lg p-2 text-foreground-secondary transition-colors hover:bg-white/[0.06] hover:text-accent-pink"
            >
              <Share2 size={15} />
            </button>
          </Tooltip>
        </div>
      </GlassCard>
    </HoverLift>
  );
}

interface QuestionGeneratorListProps {
  questions: InterviewQuestion[];
  onStart: () => void;
}

/** Question bank preview shown between generation and the live interview —
 * lets the person skim, save, or share questions before starting. Save /
 * bookmark state is local-only UI state (no assumed endpoint exists for
 * persisting it) — reset on refresh, which is noted in the page's report. */
export function QuestionGeneratorList({ questions, onStart }: QuestionGeneratorListProps) {
  return (
    <div className="flex flex-col gap-6">
      <StaggerChildren className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {questions.map((q) => (
          <StaggerItem key={q.id} className="h-full">
            <QuestionCard question={q} />
          </StaggerItem>
        ))}
      </StaggerChildren>

      <Button size="lg" onClick={onStart} className="mx-auto">
        <Play size={16} /> Start Practice Interview
      </Button>
    </div>
  );
}
