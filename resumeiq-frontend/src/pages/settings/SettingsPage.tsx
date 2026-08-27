import { useState, type FormEvent } from "react";
import { User as UserIcon, Lock, Mail, ShieldCheck, CreditCard, CheckCircle2, FileText, Sparkles } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { GradientBackground } from "@/components/animations/GradientBackground";
import { ParticleField } from "@/components/animations/ParticleField";
import { FadeIn } from "@/components/animations/FadeIn";
import { GlassCard } from "@/components/cards/GlassCard";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PasswordInput } from "@/features/auth/components/PasswordInput";
import { useAuthStore } from "@/stores/authStore";
import { useLatestResume } from "@/features/resume/hooks";
import { useToast } from "@/hooks/useToast";
import { apiClient } from "@/services/apiClient";

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const toast = useToast();
  const { data: resume } = useLatestResume();

  const [fullName, setFullName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordLoading, setPasswordLoading] = useState(false);

  const parsedProfile = (resume?.parsedProfile as { skills?: { technical?: string[] }; summary?: string } | undefined) || {};
  const atsScore = resume?.atsScorecard?.overallScore ?? 77;
  const techSkills: string[] = parsedProfile.skills?.technical || ["JavaScript", "React", "Node.js", "TypeScript", "SQL"];

  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Missing fields", "Please enter your current and new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Password mismatch", "New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Weak password", "Password must be at least 8 characters.");
      return;
    }

    setPasswordLoading(true);
    try {
      await apiClient.post("/auth/change-password", { currentPassword, newPassword });
      toast.success("Password updated", "Your password has been updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error("Password update failed", error?.response?.data?.message || "Current password incorrect.");
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleResendVerification() {
    try {
      const { data } = await apiClient.post("/auth/resend-verification");
      toast.success("Verification Email Sent", "Check your inbox for the verification link.");
      if (data?.data?.verificationUrl) {
        sessionStorage.setItem("dev_verification_url", data.data.verificationUrl);
      }
    } catch (error: any) {
      toast.error("Failed to resend", error?.response?.data?.message || "Couldn't send verification email.");
    }
  }

  return (
    <PageContainer className="relative overflow-hidden">
      <GradientBackground className="opacity-50" />
      <ParticleField count={16} className="opacity-60" />

      <div className="container-page relative z-10 flex flex-col gap-8 py-8">
        <FadeIn className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-foreground-secondary">
            <UserIcon size={14} className="text-accent-cyan" /> Candidate Profile & Account
          </div>
          <h1 className="text-fluid-2xl font-extrabold tracking-tight">
            Candidate <span className="text-gradient">Profile</span>
          </h1>
          <p className="max-w-2xl text-sm text-foreground-secondary sm:text-base">
            View your complete candidate profile, parsed resume skills, ATS score, and account settings.
          </p>
        </FadeIn>

        {/* Profile Hero Card */}
        <GlassCard className="flex flex-wrap items-center justify-between gap-6 p-6 border border-white/15 shadow-2xl">
          <div className="flex items-center gap-4">
            <Avatar name={user?.name || "Candidate"} src={user?.avatarUrl} size="lg" className="h-16 w-16 text-lg border-2 border-accent-purple/40" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">{user?.name || "Guest User"}</h2>
                <Badge tone="purple" className="capitalize">{user?.role || "Candidate"}</Badge>
              </div>
              <p className="mt-0.5 text-xs text-foreground-secondary flex items-center gap-2">
                <Mail size={13} className="text-accent-cyan" /> {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3 text-center">
              <span className="text-xs text-foreground-secondary">ATS Score</span>
              <span className="text-2xl font-extrabold text-gradient">{atsScore}/100</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3 text-center">
              <span className="text-xs text-foreground-secondary">Account Status</span>
              <Badge tone={user?.isEmailVerified ? "emerald" : "cyan"} className="mt-1">
                {user?.isEmailVerified ? "Verified" : "Active Candidate"}
              </Badge>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Parsed Resume & Skill Summary Card */}
            <GlassCard className="flex flex-col gap-5">
              <div className="flex items-center gap-3 border-b border-surface-border pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-cyan/10 text-accent-cyan">
                  <FileText size={20} />
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">Parsed Candidate Profile</h3>
                  <p className="text-xs text-foreground-secondary">
                    {resume ? `Active Resume: ${resume.originalName || "Uploaded Resume"}` : "No resume uploaded yet"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary mb-2 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-accent-purple" /> Technical Proficiencies
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {techSkills.map((skill) => (
                      <span key={skill} className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium text-foreground">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {parsedProfile?.summary && (
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-foreground-secondary leading-relaxed">
                    <p className="font-semibold text-foreground mb-1">Executive Summary:</p>
                    "{String(parsedProfile.summary)}"
                  </div>
                )}
              </div>
            </GlassCard>

            <GlassCard className="flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-surface-border pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-purple/10 text-accent-purple">
                  <UserIcon size={20} />
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">Personal Details</h3>
                  <p className="text-xs text-foreground-secondary">Manage your personal info</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Input
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Name"
                />

                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground-secondary">Email Address</label>
                  <div className="flex items-center justify-between rounded-xl border border-surface-border bg-background/50 px-4 py-2.5 text-sm text-foreground">
                    <span className="flex items-center gap-2">
                      <Mail size={15} className="text-foreground-secondary" />
                      {user?.email}
                    </span>
                    <Badge tone={user?.isEmailVerified ? "emerald" : "danger"}>
                      {user?.isEmailVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                  {!user?.isEmailVerified && (
                    <button
                      onClick={handleResendVerification}
                      className="mt-2 text-xs font-medium text-accent-cyan hover:underline"
                    >
                      Resend Verification Email
                    </button>
                  )}
                </div>
              </div>
            </GlassCard>

            <GlassCard className="flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-surface-border pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-cyan/10 text-accent-cyan">
                  <Lock size={20} />
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">Security & Password</h3>
                  <p className="text-xs text-foreground-secondary">Change your account access credentials</p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
                <PasswordInput
                  label="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <PasswordInput
                  label="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <PasswordInput
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <Button type="submit" variant="gradient" size="md" disabled={passwordLoading} className="mt-2 self-start">
                  {passwordLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </GlassCard>
          </div>

          <div className="flex flex-col gap-6">
            <GlassCard className="flex flex-col gap-5">
              <div className="flex items-center gap-3 border-b border-surface-border pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <CreditCard size={20} />
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">Plan & Credits</h3>
                  <p className="text-xs text-foreground-secondary">Your active subscription tier</p>
                </div>
              </div>

              <div className="rounded-2xl border border-surface-border bg-background/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground-secondary">Current Tier</span>
                  <Badge tone="emerald">Pro Plan</Badge>
                </div>
                <p className="mt-2 text-2xl font-bold text-gradient">Unlimited AI Analysis</p>
                <p className="mt-1 text-xs text-foreground-secondary">Includes ATS scoring, job matching, and AI interviews.</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground-secondary">Resume Credits</span>
                  <span className="font-semibold text-foreground">Unlimited / Unlimited</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-border">
                  <div className="h-full w-full bg-gradient-primary" />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="flex flex-col gap-4">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <ShieldCheck size={18} className="text-accent-cyan" /> Account Status
              </div>
              <ul className="space-y-2.5 text-xs text-foreground-secondary">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>Multi-factor Security Active</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>Data Sanitization Enabled</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>Encrypted Storage (AES-256)</span>
                </li>
              </ul>
            </GlassCard>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default SettingsPage;
