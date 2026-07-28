import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Mail, MailCheck, SendHorizonal } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { useForgotPasswordMutation } from "@/features/auth/hooks";
import { validateEmail } from "@/features/auth/validation";

export function ForgotPasswordPage() {
  const mutation = useForgotPasswordMutation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationError = validateEmail(email);
    setError(validationError);
    setTouched(true);
    if (validationError) return;
    mutation.mutate({ email });
  }

  if (mutation.isSuccess) {
    return (
      <AuthCard>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-cyan/10 text-accent-cyan">
            <MailCheck size={26} />
          </div>
          <h1 className="text-fluid-lg font-bold tracking-tight">Check your inbox</h1>
          <p className="max-w-xs text-sm text-foreground-secondary">
            If an account exists for <span className="text-foreground">{email}</span>, we've sent a link to reset your password.
          </p>
          <Link to="/login" className="mt-2 flex items-center gap-1.5 text-sm text-accent-cyan hover:underline">
            <ArrowLeft size={14} />
            Back to login
          </Link>
        </motion.div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <div className="mb-7 text-center">
        <h1 className="text-fluid-xl font-bold tracking-tight">Forgot your password?</h1>
        <p className="mt-1.5 text-sm text-foreground-secondary">
          Enter your email and we'll send you a link to reset it.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <Input
          label="Email"
          type="email"
          icon={<Mail size={15} />}
          placeholder="you@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (touched) setError(validateEmail(e.target.value));
          }}
          onBlur={() => {
            setTouched(true);
            setError(validateEmail(email));
          }}
          error={touched ? error : undefined}
          autoComplete="email"
        />

        <AnimatePresence>
          {mutation.isError && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger"
            >
              {mutation.error instanceof Error ? mutation.error.message : "Couldn't send the reset link. Please try again."}
            </motion.p>
          )}
        </AnimatePresence>

        <Button type="submit" variant="gradient" size="lg" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <LoadingSpinner size={16} label="Sending..." />
          ) : (
            <>
              <SendHorizonal size={16} />
              Send reset link
            </>
          )}
        </Button>
      </form>

      <Link to="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm text-foreground-secondary hover:text-foreground transition-colors">
        <ArrowLeft size={14} />
        Back to login
      </Link>
    </AuthCard>
  );
}
