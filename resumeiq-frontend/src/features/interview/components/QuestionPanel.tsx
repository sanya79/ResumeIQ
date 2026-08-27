import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, SkipBack, Square, Clock, FastForward, Timer } from "lucide-react";
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
  onSelectIndex?: (idx: number) => void;
  sessionDurationSeconds?: number;
}

export function QuestionPanel({
  question,
  index,
  total,
  onPrevious,
  onNext,
  onEnd,
  onElapsedChange,
  onSelectIndex,
  sessionDurationSeconds = 1200, // 20 minutes default
}: QuestionPanelProps) {
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(sessionDurationSeconds);

  // Per Question Timer
  useEffect(() => {
    setElapsed(0);
  }, [question.id]);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [paused, question.id]);

  // Session Countdown Timer
  useEffect(() => {
    if (paused) return;
    const sessionInterval = setInterval(() => {
      setSessionTimeRemaining((r) => {
        if (r <= 1) {
          clearInterval(sessionInterval);
          onEnd();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(sessionInterval);
  }, [paused, onEnd]);

  useEffect(() => {
    onElapsedChange(elapsed);
  }, [elapsed, onElapsedChange]);

  const qMinutes = Math.floor(elapsed / 60);
  const qSeconds = elapsed % 60;

  const sMinutes = Math.floor(sessionTimeRemaining / 60);
  const sSeconds = sessionTimeRemaining % 60;

  const isLowTime = sessionTimeRemaining < 300; // < 5 mins
  const isCriticalTime = sessionTimeRemaining < 120; // < 2 mins

  return (
    <GlassCard glow className="flex h-full flex-col gap-5">
      {/* Question Pills Navigator & Global Session Timer */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 max-w-full overflow-x-auto pb-1">
          {Array.from({ length: total }).map((_, qIdx) => (
            <button
              key={qIdx}
              type="button"
              onClick={() => onSelectIndex && onSelectIndex(qIdx)}
              className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold transition-all ${
                qIdx === index
                  ? "bg-accent-purple text-white shadow-glow"
                  : "bg-white/5 text-foreground-secondary hover:bg-white/10 hover:text-foreground"
              }`}
            >
              Q{qIdx + 1}
            </button>
          ))}
        </div>

        {/* Global Session Countdown Badge */}
        <div
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-xs font-semibold ${
            isCriticalTime
              ? "animate-pulse border-rose-500/50 bg-rose-950/40 text-rose-300"
              : isLowTime
              ? "border-amber-500/50 bg-amber-950/40 text-amber-300"
              : "border-white/10 bg-white/5 text-accent-cyan"
          }`}
        >
          <Timer size={14} /> Session: {sMinutes.toString().padStart(2, "0")}:{sSeconds.toString().padStart(2, "0")}
        </div>
      </div>

      <ProgressBar value={((index + 1) / total) * 100} />

      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1"
      >
        <div className="mb-3 flex items-center justify-between">
          <Badge tone="cyan">{question.category}</Badge>
          <span className="inline-flex items-center gap-1 font-mono text-xs text-foreground-secondary">
            <Clock size={12} /> Question time: {qMinutes}:{qSeconds.toString().padStart(2, "0")}
          </span>
        </div>
        <p className="text-fluid-lg font-semibold leading-relaxed text-foreground">{question.prompt}</p>
        {question.hint && (
          <p className="mt-3 rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-accent-cyan">
            💡 <strong>Hint:</strong> {question.hint}
          </p>
        )}
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
          <Button variant="outline" size="sm" onClick={onEnd} className="border-rose-500/30 text-rose-400 hover:bg-rose-950/40">
            <Square size={14} className="mr-1" /> End & Evaluate
          </Button>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onNext}
          disabled={index === total - 1}
        >
          Skip / Next <FastForward size={14} />
        </Button>
      </div>
    </GlassCard>
  );
}
