import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, MessageCircle, SendHorizonal, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useResumeChatHistory, useSendResumeChatMessage } from "@/features/resume/hooks";
import type { ResumeChatMessage } from "@/types";

interface ResumeChatAssistantProps {
  resumeId?: string;
  className?: string;
}

function ChatBubble({ message, isAssistant }: { message: ResumeChatMessage; isAssistant: boolean }) {
  return (
    <div className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}>
      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${isAssistant ? "bg-white/[0.06] text-foreground" : "bg-accent-purple/20 text-foreground"}`}>
        <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-foreground-secondary">
          {isAssistant ? <Bot size={12} /> : <MessageCircle size={12} />}
          {isAssistant ? "Assistant" : "You"}
        </div>
        <div className="whitespace-pre-wrap leading-6">{message.content}</div>
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
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, isOpen]);

  async function handleSend() {
    if (!resumeId || !draft.trim() || sendMutation.isPending) return;
    const trimmed = draft.trim();
    setDraft("");
    sendMutation.mutate({ message: trimmed, conversationId }, {
      onSuccess: (response) => setConversationId(response.conversationId),
    });
  }

  return (
    <div className={className}>
      <Button variant="gradient" size="sm" className="shadow-glow" onClick={() => setIsOpen((open) => !open)}>
        <Sparkles size={14} /> {isOpen ? "Hide assistant" : "Open assistant"}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-6 right-6 z-50 w-[92vw] max-w-[420px]"
          >
            <GlassCard glow className="flex max-h-[72vh] flex-col overflow-hidden p-0">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-accent-purple/20 p-2 text-accent-purple">
                    <Bot size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Resume chat assistant</p>
                    <p className="text-xs text-foreground-secondary">Answers from the resume context only</p>
                  </div>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-background/40 p-4">
                {isLoading && <p className="text-sm text-foreground-secondary">Loading conversation…</p>}
                {!isLoading && messages.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-3 text-sm text-foreground-secondary">
                    Ask about your experience, ATS strengths, or the next improvement to make.
                  </div>
                )}
                {messages.map((message) => (
                  <ChatBubble key={message._id} message={message} isAssistant={message.role === "assistant"} />
                ))}
                {sendMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-white/[0.06] px-3.5 py-2.5 text-sm text-foreground-secondary">
                      Thinking from the resume context…
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 p-3">
                <Textarea
                  rows={3}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Ask about this resume…"
                  className="min-h-[80px] bg-background/60"
                />
                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="text-xs text-foreground-secondary">The assistant uses your resume content and ATS signals as context.</p>
                  <Button variant="secondary" size="sm" onClick={handleSend} disabled={!draft.trim() || sendMutation.isPending}>
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
