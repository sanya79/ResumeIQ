import crypto from "crypto";
import { InterviewRepository } from "../repositories/interview.repository.js";
import { AppError } from "../utils/appError.js";

const interviewRepository = new InterviewRepository();

const QUESTION_BANK = {
  frontend: {
    TECHNICAL: [
      { prompt: "What is the virtual DOM in React and how does reconciliation work?", category: "React Core", estimatedAnswerSeconds: 120, hint: "Focus on diffing algorithm, fiber architecture, and state lifecycle changes." },
      { prompt: "Explain the difference between call, apply, and bind in JavaScript.", category: "JS Core", estimatedAnswerSeconds: 90, hint: "Mention how 'this' binding works and the parameter format differences." },
      { prompt: "How do you optimize frontend page loading speed and improve Core Web Vitals?", category: "Web Performance", estimatedAnswerSeconds: 150, hint: "Talk about bundle splitting, image optimization, lazy loading, and rendering paths." },
      { prompt: "What are CSS pseudo-classes and pseudo-elements? Give examples of each.", category: "CSS Layout", estimatedAnswerSeconds: 90, hint: "Think of hover/focus vs before/after." }
    ],
    HR: [
      { prompt: "Tell me about a time you had to resolve a disagreement with a teammate.", category: "Collaboration", estimatedAnswerSeconds: 90, hint: "Use the STAR structure and focus on your role in the resolution." },
      { prompt: "Why do you want to join this team and how do you contribute to a positive culture?", category: "Motivation", estimatedAnswerSeconds: 75, hint: "Connect your values to the company mission and your collaboration style." }
    ],
    BEHAVIOURAL: [
      { prompt: "Describe a challenge you faced under a deadline and how you handled it.", category: "Ownership", estimatedAnswerSeconds: 120, hint: "Emphasize tradeoffs, priorities, and what you learned." },
      { prompt: "Tell me about a project that required you to learn something quickly.", category: "Adaptability", estimatedAnswerSeconds: 105, hint: "Focus on how you built momentum and shared the new knowledge." }
    ]
  },
  backend: {
    TECHNICAL: [
      { prompt: "What is event-driven architecture and how does the Node.js event loop work?", category: "Node.js Core", estimatedAnswerSeconds: 150, hint: "Mention phase queues, libuv, call stack, and non-blocking I/O operations." },
      { prompt: "Explain SQL database indexing. How does it improve performance and what are the tradeoffs?", category: "Databases", estimatedAnswerSeconds: 120, hint: "Describe B-Trees, write/read cost tradeoffs, and lookup times." },
      { prompt: "What is the difference between REST APIs and GraphQL? When would you use which?", category: "API Design", estimatedAnswerSeconds: 150, hint: "Mention over-fetching, schema definitions, round-trip overhead, and endpoints." }
    ],
    HR: [
      { prompt: "Walk me through a time you had to explain complex work to a non-technical stakeholder.", category: "Communication", estimatedAnswerSeconds: 90, hint: "Focus on clarity, empathy, and the outcome." },
      { prompt: "Describe a situation where you had to receive critical feedback and improve quickly.", category: "Growth", estimatedAnswerSeconds: 100, hint: "Show humility, ownership, and your next-step plan." }
    ],
    BEHAVIOURAL: [
      { prompt: "Tell me about a time you had to collaborate across multiple teams.", category: "Cross-functional", estimatedAnswerSeconds: 120, hint: "Highlight coordination, shared goals, and follow-through." },
      { prompt: "Describe a moment you made an impact in a team beyond your assigned responsibilities.", category: "Leadership", estimatedAnswerSeconds: 110, hint: "Show initiative, influence, and concrete outcomes." }
    ]
  },
  devops: {
    TECHNICAL: [
      { prompt: "Explain the differences between Docker containers and virtual machines.", category: "Infrastructure", estimatedAnswerSeconds: 120, hint: "Talk about hypervisors, shared kernel space, memory footprints, and startup times." },
      { prompt: "What is a Kubernetes Pod, and how does it differ from a container?", category: "K8s Core", estimatedAnswerSeconds: 90, hint: "Mention pod namespaces, shared network interfaces, and volume sharing." },
      { prompt: "How do you set up a secure, zero-downtime CI/CD pipeline?", category: "CI/CD Orchestration", estimatedAnswerSeconds: 150, hint: "Talk about Blue/Green deployment, Canary releases, automated rollbacks, and unit testing." }
    ],
    HR: [
      { prompt: "Describe a time you had to balance urgent production issues with longer-term platform work.", category: "Prioritization", estimatedAnswerSeconds: 100, hint: "Highlight how you communicated priorities and risk." },
      { prompt: "Tell me about a time you improved reliability or observability for a team.", category: "Ownership", estimatedAnswerSeconds: 95, hint: "Focus on the evidence and the observed impact." }
    ],
    BEHAVIOURAL: [
      { prompt: "Tell me about a time you had to coordinate incident response under pressure.", category: "Incident Management", estimatedAnswerSeconds: 130, hint: "Show calm execution, communication, and learning." },
      { prompt: "Describe a time you had to explain a complex operational issue to senior stakeholders.", category: "Communication", estimatedAnswerSeconds: 105, hint: "Focus on clarity, evidence, and action items." }
    ]
  }
};

export class InterviewService {
  async generateQuestions(userId, payload = {}) {
    const normalizedPayload = payload?.resumeId || payload?.config?.resumeId ? payload : { ...payload, ...(payload?.config || {}) };
    const resumeId = normalizedPayload?.resumeId ?? normalizedPayload?.config?.resumeId ?? null;
    const role = normalizedPayload?.role || normalizedPayload?.targetRole || normalizedPayload?.config?.targetRole || "Software Engineer";
    const type = this._normalizeInterviewType(normalizedPayload?.type || normalizedPayload?.config?.type || "TECHNICAL");
    const timed = Boolean(normalizedPayload?.timed ?? normalizedPayload?.config?.timed ?? false);
    const difficulty = normalizedPayload?.difficulty || normalizedPayload?.config?.difficulty || "Medium";
    const experienceLevel = normalizedPayload?.experienceLevel || normalizedPayload?.config?.experienceLevel || "1-2 Years";
    const roleKey = this._mapRoleToKey(role);
    const bank = QUESTION_BANK[roleKey]?.[type] || QUESTION_BANK[roleKey]?.TECHNICAL || QUESTION_BANK.backend.TECHNICAL;

    const questions = bank.slice(0, 4).map((q, idx) => ({
      id: `q_${idx + 1}`,
      prompt: q.prompt,
      category: q.category,
      difficulty,
      estimatedAnswerSeconds: q.estimatedAnswerSeconds,
      hint: q.hint
    }));

    const session = await interviewRepository.createSession({
      userId,
      resumeId,
      role,
      type,
      timed,
      config: {
        type,
        difficulty,
        experienceLevel,
        targetRole: role
      },
      questions,
      answers: [],
      currentQuestionIndex: 0,
      elapsedSeconds: 0,
      status: "in_progress"
    });

    return {
      session: {
        id: session._id,
        resumeId: session.resumeId,
        role: session.role,
        type: session.type,
        timed: session.timed,
        status: session.status,
        currentQuestionIndex: 0,
        questionCount: questions.length
      },
      question: questions[0] ?? null
    };
  }

  async submitAnswer(userId, sessionId, questionId, answerText, responseTimeSeconds) {
    const session = await interviewRepository.findByIdAndUser(sessionId, userId);
    if (!session) {
      throw new AppError("Interview session not found.", 404);
    }

    const question = session.questions.find((q) => q.id === questionId);
    if (!question) {
      throw new AppError("Question not found in this session.", 404);
    }

    const evaluation = this._evaluateAnswerHeuristically(question, answerText, responseTimeSeconds);

    session.answers.push({
      question,
      answerText,
      responseTimeSeconds,
      evaluation
    });

    const nextIndex = session.questions.findIndex((q) => q.id === questionId) + 1;
    session.currentQuestionIndex = nextIndex < session.questions.length ? nextIndex : session.questions.length;
    session.elapsedSeconds = (session.elapsedSeconds || 0) + responseTimeSeconds;
    session.markModified("answers");
    await interviewRepository.save(session);

    const nextQuestion = session.currentQuestionIndex < session.questions.length
      ? session.questions[session.currentQuestionIndex]
      : null;

    return {
      evaluation,
      nextQuestion
    };
  }

  async finishSession(userId, sessionId) {
    const session = await interviewRepository.findByIdAndUser(sessionId, userId);
    if (!session) {
      throw new AppError("Interview session not found.", 404);
    }

    const answers = session.answers || [];
    const count = answers.length;

    let totalScore = 0;
    let totalTech = 0;
    let totalComm = 0;
    let totalConf = 0;
    let totalResponseTime = 0;
    let totalClarity = 0;
    let totalProblemSolving = 0;
    let totalCompleteness = 0;

    answers.forEach((answer) => {
      totalScore += answer.evaluation.overallRating;
      totalTech += answer.evaluation.technicalAccuracy;
      totalComm += answer.evaluation.communicationScore;
      totalConf += answer.evaluation.confidenceScore;
      totalResponseTime += answer.responseTimeSeconds;
      totalClarity += answer.evaluation.clarity;
      totalProblemSolving += answer.evaluation.problemSolving;
      totalCompleteness += answer.evaluation.completeness;
    });

    const overallScore = count > 0 ? Math.round(totalScore / count) : 70;
    const technicalScore = count > 0 ? Math.round(totalTech / count) : 70;
    const communicationScore = count > 0 ? Math.round(totalComm / count) : 70;
    const confidenceLevel = count > 0 ? Math.round(totalConf / count) : 70;
    const averageResponseTimeSeconds = count > 0 ? Math.round(totalResponseTime / count) : 90;
    const starScore = count > 0 ? Math.round((totalClarity + totalProblemSolving + totalCompleteness) / (count * 3)) : 70;

    const categoryScores = [
      { category: "Technical Accuracy", score: technicalScore },
      { category: "Communication & Clarity", score: communicationScore },
      { category: "Problem Solving", score: Math.round((overallScore + starScore) / 2) }
    ];

    const confidenceTimeline = answers.map((answer, idx) => ({
      questionIndex: idx + 1,
      confidenceScore: answer.evaluation.confidenceScore
    }));

    const responseTimes = answers.map((answer, idx) => ({
      questionIndex: idx + 1,
      seconds: answer.responseTimeSeconds,
      estimatedSeconds: answer.question.estimatedAnswerSeconds
    }));

    const strengths = this._collectStrengths(answers);
    const weaknesses = this._collectWeaknesses(answers);
    const perQuestionBreakdown = answers.map((answer) => ({
      questionId: answer.question.id,
      questionPrompt: answer.question.prompt,
      score: answer.evaluation.overallRating,
      feedback: answer.evaluation.suggestedImprovements.join(" ")
    }));

    const report = {
      sessionId: session._id,
      overallScore,
      interviewReadiness: Math.round(overallScore * 0.95),
      confidenceLevel,
      technicalScore,
      communicationScore,
      starScore,
      averageResponseTimeSeconds,
      questionAccuracy: overallScore,
      categoryScores,
      confidenceTimeline,
      responseTimes,
      strengths,
      weaknesses,
      perQuestionBreakdown,
      answers
    };

    session.status = "completed";
    session.report = report;
    await interviewRepository.save(session);

    return report;
  }

  async completeSession(userId, sessionId) {
    return this.finishSession(userId, sessionId);
  }

  async getHistory(userId) {
    const history = await interviewRepository.findHistoryByUserId(userId);
    return history.map((h) => ({
      id: h._id,
      date: h.createdAt.toISOString().split("T")[0],
      targetRole: h.config.targetRole,
      difficulty: h.config.difficulty,
      overallScore: h.report?.overallScore || 70,
      timeTakenSeconds: (h.report?.responseTimes || []).reduce((sum, item) => sum + item.seconds, 0),
      result: (h.report?.overallScore || 70) >= 85 ? "Strong Pass" : (h.report?.overallScore || 70) >= 65 ? "Pass" : "Needs Improvement"
    }));
  }

  async getReportDetails(userId, sessionId) {
    const session = await interviewRepository.findByIdAndUser(sessionId, userId);
    if (!session || !session.report) {
      throw new AppError("Completed performance report not found.", 404);
    }
    return session.report;
  }

  async getPracticeRecommendations(userId) {
    return [
      { id: "prac_1", title: "JavaScript Closures & Scope", description: "Practice questions related to lexical scoping, executions, and bindings.", category: "Technical" },
      { id: "prac_2", title: "STAR Method Behavioral Drill", description: "Answer standard recruiter questions using Situation, Task, Action, and Result structures.", category: "Behavioral" },
      { id: "prac_3", title: "Docker Networking & Storage", description: "Deploy local multi-container setups and mount configurations.", category: "System Design" }
    ];
  }

  _normalizeInterviewType(type) {
    const normalized = (type || "TECHNICAL").toUpperCase();
    if (normalized === "HR") return "HR";
    if (normalized === "BEHAVIOURAL") return "BEHAVIOURAL";
    if (normalized === "SYSTEM DESIGN" || normalized === "PROJECT DISCUSSION") return "TECHNICAL";
    return "TECHNICAL";
  }

  _mapRoleToKey(role) {
    const norm = role.toLowerCase();
    if (norm.includes("frontend") || norm.includes("design") || norm.includes("ui")) return "frontend";
    if (norm.includes("devops") || norm.includes("infra") || norm.includes("cloud")) return "devops";
    return "backend";
  }

  _collectStrengths(answers) {
    return answers.flatMap((answer) => answer.evaluation.strengths || []).slice(0, 8);
  }

  _collectWeaknesses(answers) {
    return answers.flatMap((answer) => answer.evaluation.weaknesses || []).slice(0, 8);
  }

  _evaluateAnswerHeuristically(question, answerText, responseTime) {
    const length = (answerText || "").trim().length;

    let baseScore = 60;
    if (length > 250) baseScore += 25;
    else if (length > 100) baseScore += 15;
    else baseScore -= 15;

    const ideal = question.estimatedAnswerSeconds;
    const diff = Math.abs(responseTime - ideal);
    if (diff < 30) baseScore += 5;
    else if (responseTime > ideal * 2) baseScore -= 5;

    const rawScore = Math.min(100, Math.max(10, baseScore + Math.floor(Math.random() * 11) - 5));

    return {
      communicationScore: Math.min(100, rawScore + 5),
      technicalAccuracy: rawScore,
      confidenceScore: Math.min(100, rawScore - 2),
      clarity: Math.min(100, rawScore + 1),
      problemSolving: rawScore,
      grammar: Math.min(100, rawScore + 6),
      completeness: rawScore,
      overallRating: rawScore,
      strengths: [
        "Structured layout of core points",
        length > 200 ? "Clear technical depth in explanation" : "Concise description"
      ],
      weaknesses: [
        length < 150 ? "Response could benefit from real-world implementation examples." : "Few spelling/grammar inconsistencies"
      ],
      suggestedImprovements: [
        "Include STAR framework elements for structured delivery.",
        "Highlight tradeoffs explicitly."
      ],
      alternativeAnswer: `An ideal response would explain that ${question.prompt.split("?")[0]} involves key concepts such as caching, decoupling, and dependency management. For example, implementing custom middleware or design patterns ensures clean architecture.`,
      missingPoints: [
        "Tradeoff parameters",
        "Alternative approaches"
      ],
      recommendedReading: [
        `Official documentation on ${question.category}`,
        "System Architecture reference tutorials"
      ]
    };
  }
}

export default InterviewService;
