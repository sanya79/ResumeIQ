import { useRef, useState } from "react";
import { ClipboardPaste, Trash2, UploadCloud, History, Hash, Type, KeyRound } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HoverLift } from "@/components/animations/HoverLift";
import { useToast } from "@/hooks/useToast";
import { getJobDescriptionStats } from "../jdStats";
import { getRecentJobDescriptions, removeRecentJobDescription, type RecentJobDescription } from "../recentJobDescriptions";

interface JobDescriptionPanelProps {
  value: string;
  onChange: (value: string) => void;
  jobTitle: string;
  onJobTitleChange: (value: string) => void;
  company: string;
  onCompanyChange: (value: string) => void;
  disabled?: boolean;
}

function StatPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-1.5 text-xs text-foreground-secondary">
      <span className="text-accent-cyan">{icon}</span>
      <span className="font-medium tabular-nums text-foreground">{value.toLocaleString()}</span>
      {label}
    </div>
  );
}

export function JobDescriptionPanel({
  value,
  onChange,
  jobTitle,
  onJobTitleChange,
  company,
  onCompanyChange,
  disabled,
}: JobDescriptionPanelProps) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recent, setRecent] = useState<RecentJobDescription[]>(() => getRecentJobDescriptions());
  const stats = getJobDescriptionStats(value);

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) onChange(text);
      else toast.info("Clipboard empty", "Nothing to paste yet.");
    } catch {
      toast.error("Couldn't read clipboard", "Your browser blocked clipboard access — paste manually instead.");
    }
  }

  function handleClear() {
    onChange("");
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("text/") && !file.name.endsWith(".txt")) {
      toast.error("Unsupported file", "Import a plain-text (.txt) job description.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result ?? ""));
    reader.readAsText(file);
  }

  function handleUseRecent(entry: RecentJobDescription) {
    onChange(entry.fullText);
    if (entry.title) onJobTitleChange(entry.title);
    if (entry.company) onCompanyChange(entry.company);
  }

  function handleRemoveRecent(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    removeRecentJobDescription(id);
    setRecent(getRecentJobDescriptions());
  }

  return (
    <div className="flex flex-col gap-5">
      <GlassCard glow className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={jobTitle}
            onChange={(e) => onJobTitleChange(e.target.value)}
            placeholder="Job title (optional)"
            disabled={disabled}
            className="w-full rounded-xl border border-surface-border bg-white/[0.04] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-secondary/60 transition-colors focus:border-accent-purple/60 focus:bg-white/[0.06] disabled:opacity-50"
          />
          <input
            value={company}
            onChange={(e) => onCompanyChange(e.target.value)}
            placeholder="Company (optional)"
            disabled={disabled}
            className="w-full rounded-xl border border-surface-border bg-white/[0.04] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-secondary/60 transition-colors focus:border-accent-purple/60 focus:bg-white/[0.06] disabled:opacity-50"
          />
        </div>

        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste the full job description here — the more detail, the more precise the match."
          rows={14}
          disabled={disabled}
          className="min-h-[280px] font-normal leading-relaxed"
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={handlePaste} disabled={disabled}>
            <ClipboardPaste size={14} /> Paste
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={handleClear} disabled={disabled || !value}>
            <Trash2 size={14} /> Clear
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleImportClick} disabled={disabled}>
            <UploadCloud size={14} /> Import Job Description
          </Button>
          <input ref={fileInputRef} type="file" accept=".txt,text/plain" className="hidden" onChange={handleFileSelected} />
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-surface-border pt-4">
          <StatPill icon={<Type size={12} />} label="characters" value={stats.characterCount} />
          <StatPill icon={<Hash size={12} />} label="words" value={stats.wordCount} />
          <StatPill icon={<KeyRound size={12} />} label="est. ATS keywords" value={stats.estimatedKeywordCount} />
        </div>
      </GlassCard>

      {recent.length > 0 && (
        <GlassCard className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <History size={15} className="text-accent-purple" /> Recent Job Descriptions
          </div>
          <div className="flex flex-col gap-2">
            {recent.map((entry) => (
              <HoverLift key={entry.id}>
                <button
                  type="button"
                  onClick={() => handleUseRecent(entry)}
                  disabled={disabled}
                  className="flex w-full items-start justify-between gap-3 rounded-xl bg-white/[0.03] px-3.5 py-3 text-left transition-colors hover:bg-white/[0.06] disabled:opacity-50"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">{entry.title}</p>
                      {entry.company && (
                        <Badge tone="neutral" className="shrink-0">
                          {entry.company}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 truncate text-xs text-foreground-secondary">{entry.snippet}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveRecent(entry.id, e)}
                    aria-label="Remove"
                    className="shrink-0 rounded-lg p-1.5 text-foreground-secondary hover:bg-white/[0.06] hover:text-danger"
                  >
                    <Trash2 size={13} />
                  </button>
                </button>
              </HoverLift>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
