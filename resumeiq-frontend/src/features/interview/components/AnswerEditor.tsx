import { useEffect, useMemo, useState } from "react";
import { Send, Volume2 } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

const AVERAGE_SPEAKING_WORDS_PER_MINUTE = 130;

interface AnswerEditorProps {
  questionId: string;
  onSubmit: (answerText: string) => void;
  isSubmitting: boolean;
  externalText?: string;
  onTextChange?: (text: string) => void;
}

export function AnswerEditor({ questionId, onSubmit, isSubmitting, externalText, onTextChange }: AnswerEditorProps) {
  const [answer, setAnswer] = useState(externalText ?? "");

  useEffect(() => {
    if (externalText !== undefined) {
      setAnswer(externalText);
    }
  }, [externalText]);

  useEffect(() => {
    setAnswer("");
  }, [questionId]);

  function handleChange(val: string) {
    setAnswer(val);
    if (onTextChange) onTextChange(val);
  }

  const wordCount = useMemo(() => (answer.trim() ? answer.trim().split(/\s+/).length : 0), [answer]);
  const speakingSeconds = Math.round((wordCount / AVERAGE_SPEAKING_WORDS_PER_MINUTE) * 60);

  return (
    <GlassCard glow className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Your Spoken / Typed Answer</h3>
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-accent-cyan font-medium">
          <Volume2 size={13} /> Voice & Text Active
        </span>
      </div>

      <Textarea
        key={questionId}
        value={answer}
        onChange={(e) => handleChange(e.target.value)}
        rows={10}
        placeholder="Speak into your microphone or type your response here... Live speech-to-text transcript will appear here automatically."
        className="flex-1 resize-none font-sans leading-relaxed"
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
        <Send size={15} /> {isSubmitting ? "Evaluating Answer with AI..." : "Submit Answer"}
      </Button>
    </GlassCard>
  );
}
