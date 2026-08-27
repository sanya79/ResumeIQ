import { Sparkles } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { Chip } from "@/components/ui/Chip";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { InterviewConfig, InterviewType, InterviewDifficulty, ExperienceLevel } from "@/types";

const interviewTypes: InterviewType[] = [
  "Technical",
  "HR",
  "Behavioral",
  "System Design",
  "Project Discussion",
  "Mixed",
];
const difficulties: InterviewDifficulty[] = ["Easy", "Medium", "Hard", "Expert"];
const experienceLevels: ExperienceLevel[] = ["Fresher", "1-2 Years", "3-5 Years", "5+ Years"];
const targetRoles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "Data Scientist",
  "Machine Learning Engineer",
  "Cloud Engineer",
  "DevOps Engineer",
  "Cyber Security",
  "UI/UX",
];

interface InterviewConfigPanelProps {
  config: InterviewConfig;
  onChange: (config: InterviewConfig) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

function ChipGroup<T extends string>({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: T[];
  value: T;
  onSelect: (v: T) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground-secondary">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <Chip key={opt} selected={value === opt} onClick={() => onSelect(opt)}>
            {opt}
          </Chip>
        ))}
      </div>
    </div>
  );
}

export function InterviewConfigPanel({ config, onChange, onGenerate, isGenerating }: InterviewConfigPanelProps) {
  return (
    <GlassCard glow className="flex flex-col gap-6">
      <ChipGroup
        label="Interview Type"
        options={interviewTypes}
        value={config.type}
        onSelect={(type) => onChange({ ...config, type })}
      />
      <ChipGroup
        label="Difficulty"
        options={difficulties}
        value={config.difficulty}
        onSelect={(difficulty) => onChange({ ...config, difficulty })}
      />
      <ChipGroup
        label="Experience Level"
        options={experienceLevels}
        value={config.experienceLevel}
        onSelect={(experienceLevel) => onChange({ ...config, experienceLevel })}
      />

      <Select
        label="Target Role"
        value={config.targetRole}
        onChange={(e) => onChange({ ...config, targetRole: e.target.value })}
        options={targetRoles.map((r) => ({ label: r, value: r }))}
      />

      <Button size="lg" onClick={onGenerate} disabled={isGenerating} className="w-full">
        <Sparkles size={16} /> {isGenerating ? "Generating…" : "Generate Questions"}
      </Button>
    </GlassCard>
  );
}
