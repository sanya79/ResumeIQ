import { useState, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, RotateCcw, ArrowRight } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { GradientBackground } from "@/components/animations/GradientBackground";
import { ParticleField } from "@/components/animations/ParticleField";
import { FadeIn } from "@/components/animations/FadeIn";
import { SlideUp } from "@/components/animations/SlideUp";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  useGenerateQuestions,
  useSubmitAnswer,
  useCompleteSession,
  useInterviewHistory,
  useRecommendedPractice,
} from "@/features/interview/hooks";
import { useQuestionGenPipeline } from "@/features/interview/useQuestionGenPipeline";
import { InterviewConfigPanel } from "@/features/interview/components/InterviewConfigPanel";
import { QuestionGenTimeline } from "@/features/interview/components/QuestionGenTimeline";
import { QuestionGeneratorList } from "@/features/interview/components/QuestionGeneratorList";
import { QuestionPanel } from "@/features/interview/components/QuestionPanel";
import { AnswerEditor } from "@/features/interview/components/AnswerEditor";
import { EvaluationScoresPanel } from "@/features/interview/components/EvaluationScoresPanel";
import { FeedbackPanel } from "@/features/interview/components/FeedbackPanel";
import { PerformanceReportHero } from "@/features/interview/components/PerformanceReportHero";
import { InterviewHistoryTimeline } from "@/features/interview/components/InterviewHistoryTimeline";
import { RecommendedPracticeGrid } from "@/features/interview/components/RecommendedPracticeGrid";
import { ExportBar } from "@/features/interview/components/ExportBar";
import type { InterviewConfig, InterviewQuestion, AnswerEvaluation, PerformanceReport } from "@/types";

const CategoryScoreRadar = lazy(() =>
  import("@/features/interview/components/InterviewCharts").then((m) => ({ default: m.CategoryScoreRadar }))
);
const ConfidenceTimelineChart = lazy(() =>
  import("@/features/interview/components/InterviewCharts").then((m) => ({ default: m.ConfidenceTimelineChart }))
);
const ResponseTimeChart = lazy(() =>
  import("@/features/interview/components/InterviewCharts").then((m) => ({ default: m.ResponseTimeChart }))
);

const defaultConfig: InterviewConfig = {
  type: "Technical",
  difficulty: "Medium",
  experienceLevel: "1-2 Years",
  targetRole: "Frontend Developer",
};

type Stage = "config" | "questions" | "live" | "report";

function describeApiError(error: unknown, fallbackTitle: string): { title: string; description: string } {
  const withResponse = error as { response?: { status?: number; data?: { message?: string } }; request?: unknown };
  const message = withResponse?.response?.data?.message;
  const status = withResponse?.response?.status;

  if (status && status >= 500) {
    return { title: "Server unavailable", description: message ?? "The server ran into a problem. Please try again shortly." };
  }
  if (!withResponse?.response && withResponse?.request) {
    return { title: "Server unavailable", description: "Couldn't reach the server. Check your connection and try again." };
  }
  return { title: fallbackTitle, description: message ?? "Something went wrong. Please try again." };
}

function ChartFallback() {
  return <Skeleton className="h-72 w-full rounded-2xl" />;
}

export function InterviewPage() {
  const [config, setConfig] = useState<InterviewConfig>(defaultConfig);
  const [stage, setStage] = useState<Stage>("config");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentEvaluation, setCurrentEvaluation] = useState<AnswerEvaluation | null>(null);
  const [report, setReport] = useState<PerformanceReport | null>(null);

  const generateQuestions = useGenerateQuestions();
  const { statuses } = useQuestionGenPipeline(generateQuestions.isPending);
  const submitAnswer = useSubmitAnswer(generateQuestions.data?.sessionId);
  const completeSession = useCompleteSession();
  const historyQuery = useInterviewHistory();
  const recommendationsQuery = useRecommendedPractice();

  const session = generateQuestions.data;
  const questions: InterviewQuestion[] = session?.questions ?? [];
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  function handleGenerate() {
    generateQuestions.mutate(config, { onSuccess: () => setStage("questions") });
  }

  function handleStartInterview() {
    setCurrentIndex(0);
    setCurrentEvaluation(null);
    setStage("live");
  }

  function handleSubmitAnswer(answerText: string) {
    if (!currentQuestion) return;
    submitAnswer.mutate(
      { questionId: currentQuestion.id, answerText, responseTimeSeconds: elapsedSeconds },
      { onSuccess: (evaluation) => setCurrentEvaluation(evaluation) }
    );
  }

  function handleNextOrFinish() {
    setCurrentEvaluation(null);
    if (isLastQuestion) {
      if (!session) return;
      completeSession.mutate(session.sessionId, {
        onSuccess: (result) => {
          setReport(result);
          setStage("report");
        },
      });
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  function handleRestart() {
    generateQuestions.reset();
    setStage("config");
    setCurrentIndex(0);
    setCurrentEvaluation(null);
    setReport(null);
  }

  return (
    <PageContainer className="relative overflow-hidden">
      <GradientBackground className="opacity-50" />
      <ParticleField count={16} className="opacity-60" />

      <div className="container-page relative z-10 flex flex-col gap-8 py-10">
        <FadeIn className="text-center">
          <h1 className="text-fluid-2xl font-bold tracking-tight">
            AI <span className="text-gradient bg-gradient-lg animate-gradient-move">Interview Preparation</span>
          </h1>
          <p className="mt-2 text-sm text-foreground-secondary">
            Practice interviews powered by AI and improve your confidence.
          </p>
        </FadeIn>

        <AnimatePresence mode="wait">
          {stage === "config" && !generateQuestions.isPending && (
            <motion.div key="config" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-8">
              <div className="mx-auto w-full max-w-2xl">
                <InterviewConfigPanel
                  config={config}
                  onChange={setConfig}
                  onGenerate={handleGenerate}
                  isGenerating={generateQuestions.isPending}
                />
                {generateQuestions.isError && (
                  <div className="mt-4">
                    <ErrorState {...describeApiError(generateQuestions.error, "Failed to generate questions")} onRetry={handleGenerate} />
                  </div>
                )}
              </div>

              <SlideUp>
                {recommendationsQuery.data && recommendationsQuery.data.length > 0 && (
                  <RecommendedPracticeGrid items={recommendationsQuery.data} />
                )}
              </SlideUp>

              <SlideUp>
                {historyQuery.isLoading ? (
                  <Skeleton className="h-64 w-full rounded-2xl" />
                ) : historyQuery.isError ? (
                  <ErrorState title="Couldn't load history" description="Something went wrong reaching the server." onRetry={() => historyQuery.refetch()} />
                ) : (
                  <InterviewHistoryTimeline history={historyQuery.data ?? []} />
                )}
              </SlideUp>
            </motion.div>
          )}

          {generateQuestions.isPending && (
            <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <QuestionGenTimeline statuses={statuses} />
            </motion.div>
          )}

          {stage === "questions" && questions.length > 0 && (
            <motion.div key="questions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <QuestionGeneratorList questions={questions} onStart={handleStartInterview} />
            </motion.div>
          )}

          {stage === "live" && currentQuestion && (
            <motion.div key="live" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-6">
              {!currentEvaluation ? (
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <QuestionPanel
                    question={currentQuestion}
                    index={currentIndex}
                    total={questions.length}
                    onPrevious={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                    onNext={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                    onEnd={handleRestart}
                    onElapsedChange={setElapsedSeconds}
                  />
                  <AnswerEditor
                    questionId={currentQuestion.id}
                    onSubmit={handleSubmitAnswer}
                    isSubmitting={submitAnswer.isPending}
                  />
                  {submitAnswer.isError && (
                    <div className="xl:col-span-2">
                      <ErrorState {...describeApiError(submitAnswer.error, "Evaluation failed")} onRetry={() => submitAnswer.reset()} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <EvaluationScoresPanel evaluation={currentEvaluation} />
                  <FeedbackPanel evaluation={currentEvaluation} />
                  <Button size="lg" onClick={handleNextOrFinish} disabled={completeSession.isPending} className="mx-auto">
                    {isLastQuestion ? (completeSession.isPending ? "Generating report…" : "View Performance Report") : "Next Question"}
                    <ArrowRight size={16} />
                  </Button>
                  {completeSession.isError && (
                    <ErrorState {...describeApiError(completeSession.error, "Couldn't generate your report")} onRetry={handleNextOrFinish} />
                  )}
                </div>
              )}
            </motion.div>
          )}

          {stage === "report" && report && (
            <motion.div key="report" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-fluid-lg font-semibold">
                  <Sparkles size={18} className="text-accent-purple" /> Performance Report
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  <ExportBar report={report} />
                  <Button variant="secondary" size="sm" onClick={handleRestart}>
                    <RotateCcw size={14} /> Practice Again
                  </Button>
                </div>
              </div>

              <PerformanceReportHero report={report} />

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <Suspense fallback={<ChartFallback />}>
                  <CategoryScoreRadar data={report.categoryScores} />
                </Suspense>
                <Suspense fallback={<ChartFallback />}>
                  <ConfidenceTimelineChart data={report.confidenceTimeline} />
                </Suspense>
              </div>
              <Suspense fallback={<ChartFallback />}>
                <ResponseTimeChart data={report.responseTimes} />
              </Suspense>

              {recommendationsQuery.data && recommendationsQuery.data.length > 0 && (
                <RecommendedPracticeGrid items={recommendationsQuery.data} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageContainer>
  );
}
