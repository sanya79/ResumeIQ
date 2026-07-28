import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, SkipBack, SkipForward, Square, Clock } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { ProgressBar } from "@/components/charts/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { InterviewQuestion } from "@/types";

interface QuestionPanelProps {
  question: InterviewQuestion;
  index: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  onEnd: () => void;
  onElapsedChange: (seconds: number) => void;
}

/** Owns the live per-question stopwatch (counts up, not down — there's no
 * hard cutoff, just an "estimated" time shown for reference) and reports
 * elapsed seconds up to the parent so it can attach a real response time
 * to the answer submission. */
export function QuestionPanel({ question, index, total, onPrevious, onNext, onEnd, onElapsedChange }: QuestionPanelProps) {
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setElapsed(0);
  }, [question.id]);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, question.id]);

  useEffect(() => {
    onElapsedChange(elapsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <GlassCard glow className="flex h-full flex-col gap-5">
      <div className="flex items-center justify-between">
        <Badge tone="purple">
          Question {index + 1} of {total}
        </Badge>
        <span className="inline-flex items-center gap-1.5 font-mono text-sm text-foreground-secondary">
          <Clock size={14} />
          {minutes}:{seconds.toString().padStart(2, "0")}
        </span>
      </div>

      <ProgressBar value={((index + 1) / total) * 100} />

      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1"
      >
        <Badge tone="cyan" className="mb-3">
          {question.category}
        </Badge>
        <p className="text-fluid-lg font-semibold leading-relaxed text-foreground">{question.prompt}</p>
        <p className="mt-3 text-xs text-foreground-secondary">
          Estimated answer time: ~{Math.round(question.estimatedAnswerSeconds / 60)} min
        </p>
      </motion.div>

      <div className="flex items-center justify-between gap-2 border-t border-surface-border pt-4">
        <Button variant="ghost" size="sm" onClick={onPrevious} disabled={index === 0}>
          <SkipBack size={14} /> Previous
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setPaused((p) => !p)}>
            {paused ? <Play size={14} /> : <Pause size={14} />} {paused ? "Resume" : "Pause"}
          </Button>
          <Button variant="ghost" size="sm" onClick={onEnd}>
            <Square size={14} /> End
          </Button>
        </div>
        <Button variant="secondary" size="sm" onClick={onNext} disabled={index === total - 1}>
          Next <SkipForward size={14} />
        </Button>
      </div>
    </GlassCard>
  );
}
