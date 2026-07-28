import { useMemo, useState } from "react";
import { Mic, Send } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";

const AVERAGE_SPEAKING_WORDS_PER_MINUTE = 130;

interface AnswerEditorProps {
  questionId: string;
  onSubmit: (answerText: string) => void;
  isSubmitting: boolean;
}

export function AnswerEditor({ questionId, onSubmit, isSubmitting }: AnswerEditorProps) {
  const [answer, setAnswer] = useState("");

  const wordCount = useMemo(() => (answer.trim() ? answer.trim().split(/\s+/).length : 0), [answer]);
  const speakingSeconds = Math.round((wordCount / AVERAGE_SPEAKING_WORDS_PER_MINUTE) * 60);

  return (
    <GlassCard glow className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Your Answer</h3>
        <Tooltip content="Voice answers are coming soon — this is a UI placeholder only.">
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 rounded-lg border border-surface-border px-2.5 py-1.5 text-xs text-foreground-secondary opacity-60"
          >
            <Mic size={13} /> Voice answer
          </button>
        </Tooltip>
      </div>

      <Textarea
        key={questionId}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={12}
        placeholder="Type your answer here — speak it out loud as you type for the best practice effect."
        className="flex-1 resize-none"
      />

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-foreground-secondary">
        <span>
          {answer.length} characters · {wordCount} words
        </span>
        <span>~{speakingSeconds}s estimated speaking time</span>
      </div>

      <Button
        size="lg"
        onClick={() => onSubmit(answer)}
        disabled={!answer.trim() || isSubmitting}
        className="w-full"
      >
        <Send size={15} /> {isSubmitting ? "Evaluating…" : "Submit Answer"}
      </Button>
    </GlassCard>
  );
}
