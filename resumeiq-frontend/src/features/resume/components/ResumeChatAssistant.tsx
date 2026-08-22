import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, MessageCircle, SendHorizonal, Sparkles, X, Lightbulb } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useResumeChatHistory, useSendResumeChatMessage } from "@/features/resume/hooks";
import type { ResumeChatMessage } from "@/types";

interface ResumeChatAssistantProps {
  resumeId?: string;
  className?: string;
}

const QUICK_PROMPTS = [
  "📈 How to boost my ATS score?",
  "🛠️ What are my top skills?",
  "📝 Summarize my resume",
  "💡 Technical interview prep",
];

function FormatMessageContent({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-1.5 text-sm leading-6 break-words whitespace-pre-wrap overflow-hidden">
      {lines.map((line, idx) => {
        if (!line.trim()) return <div key={idx} className="h-1" />;

        const trimmed = line.trim();
        const isBullet = trimmed.startsWith("•") || trimmed.startsWith("- ");
        const cleanContent = isBullet ? trimmed.replace(/^[•-]\s*/, "") : line;

        // Process bold syntax **text**
        const parts = cleanContent.split(/(\*\*[^*]+\*\*)/g);
        const rendered = parts.map((part, pIdx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={pIdx} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
          }
          return part;
        });

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-accent-cyan select-none mt-1 text-xs shrink-0">•</span>
              <div className="flex-1 min-w-0 break-words">{rendered}</div>
            </div>
          );
        }

        return <div key={idx} className="break-words">{rendered}</div>;
      })}
    </div>
  );
}

function ChatBubble({ message, isAssistant }: { message: ResumeChatMessage; isAssistant: boolean }) {
  return (
    <div className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}>
      <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm shadow-sm overflow-hidden ${isAssistant ? "bg-white/[0.07] border border-white/10 text-foreground" : "bg-accent-purple/25 border border-accent-purple/30 text-foreground"}`}>
        <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground-secondary">
          {isAssistant ? <Bot size={13} className="text-accent-cyan shrink-0" /> : <MessageCircle size={13} className="text-accent-purple shrink-0" />}
          {isAssistant ? "ResumeIQ Assistant" : "You"}
        </div>
        <FormatMessageContent text={message.content} />
      </div>
    </div>
  );
}

export function ResumeChatAssistant({ resumeId, className }: ResumeChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: history = [], isLoading } = useResumeChatHistory(resumeId);
  const sendMutation = useSendResumeChatMessage(resumeId);

  const messages = useMemo(() => history, [history]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isOpen, sendMutation.isPending]);

  async function handleSend(customText?: string) {
    const textToSend = customText || draft;
    if (!resumeId || !textToSend.trim() || sendMutation.isPending) return;
    const trimmed = textToSend.trim();
    setDraft("");
    sendMutation.mutate(
      { message: trimmed, conversationId },
      {
        onSuccess: (response) => setConversationId(response.conversationId),
      }
    );
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div className={className}>
      <Button variant="gradient" size="sm" className="shadow-glow" onClick={() => setIsOpen((open) => !open)}>
        <Sparkles size={14} /> {isOpen ? "Hide assistant" : "Ask Chat Assistant"}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            className="fixed bottom-6 right-6 z-50 w-[92vw] max-w-[460px]"
          >
            <GlassCard glow className="flex h-[80vh] max-h-[600px] flex-col overflow-hidden p-0 border border-white/15 shadow-2xl">
              <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-background/80 px-4 py-3 backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-xl bg-accent-purple/20 p-2 text-accent-purple border border-accent-purple/30">
                    <Bot size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      ResumeIQ AI Assistant
                    </p>
                    <p className="text-[11px] text-foreground-secondary">Powered by Gemini AI & Resume IQ Intelligence</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-foreground-secondary hover:bg-white/10 hover:text-foreground transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div ref={scrollRef} className="flex-1 min-h-0 space-y-3.5 overflow-y-auto bg-background/50 p-4">
                {isLoading && <p className="text-sm text-foreground-secondary">Loading conversation…</p>}

                {!isLoading && messages.length === 0 && (
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 text-sm text-foreground-secondary leading-6">
                      👋 Hi! Ask me <strong>ANY</strong> question about your resume, ATS score, skills, work experience, coding topics, or technical interview prep.
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-secondary flex items-center gap-1">
                        <Lightbulb size={12} className="text-amber-400" /> Quick Questions:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {QUICK_PROMPTS.map((prompt, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(prompt)}
                            className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs text-foreground transition-all hover:border-accent-purple/50 hover:bg-accent-purple/15 text-left"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <ChatBubble key={message._id} message={message} isAssistant={message.role === "assistant"} />
                ))}

                {sendMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-white/[0.07] border border-white/10 px-4 py-3 text-sm text-foreground-secondary flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-accent-cyan animate-ping" />
                      Thinking & generating answer…
                    </div>
                  </div>
                )}
              </div>

              <div className="flex shrink-0 flex-col border-t border-white/10 bg-background/80 p-3.5 backdrop-blur-md">
                <Textarea
                  rows={2}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask any question about your resume, career, or coding…"
                  className="min-h-[60px] max-h-[100px] bg-background/70 text-sm focus:border-accent-purple/50 resize-none"
                />
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <p className="text-[11px] text-foreground-secondary">Press Enter to send</p>
                  <Button variant="gradient" size="sm" onClick={() => handleSend()} disabled={!draft.trim() || sendMutation.isPending}>
                    <SendHorizonal size={14} /> Send
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ResumeChatAssistant;

