import crypto from "crypto";
import { InterviewRepository } from "../repositories/interview.repository.js";
import { AppError } from "../utils/appError.js";

const interviewRepository = new InterviewRepository();

// A local static bank of questions to provide high-quality context-relevant queries
const QUESTION_BANK = {
  frontend: [
    { prompt: "What is the virtual DOM in React and how does reconciliation work?", category: "React Core", estimatedAnswerSeconds: 120, hint: "Focus on diffing algorithm, fiber architecture, and state lifecycle changes." },
    { prompt: "Explain the difference between call, apply, and bind in JavaScript.", category: "JS Core", estimatedAnswerSeconds: 90, hint: "Mention how 'this' binding works and the parameter format differences." },
    { prompt: "How do you optimize frontend page loading speed and improve Core Web Vitals?", category: "Web Performance", estimatedAnswerSeconds: 150, hint: "Talk about bundle splitting, image optimization, lazy loading, and rendering paths." },
    { prompt: "What are CSS pseudo-classes and pseudo-elements? Give examples of each.", category: "CSS Layout", estimatedAnswerSeconds: 90, hint: "Think of hover/focus vs before/after." },
    { prompt: "Explain client-side rendering (CSR) vs server-side rendering (SSR) and static site generation (SSG).", category: "System Architecture", estimatedAnswerSeconds: 180, hint: "Compare SEO benefit, initial page load speed, and server overhead." }
  ],
  backend: [
    { prompt: "What is event-driven architecture and how does the Node.js event loop work?", category: "Node.js Core", estimatedAnswerSeconds: 150, hint: "Mention phase queues, libuv, call stack, and non-blocking I/O operations." },
    { prompt: "Explain SQL database indexing. How does it improve performance and what are the tradeoffs?", category: "Databases", estimatedAnswerSeconds: 120, hint: "Describe B-Trees, write/read cost tradeoffs, and lookup times." },
    { prompt: "What is the difference between REST APIs and GraphQL? When would you use which?", category: "API Design", estimatedAnswerSeconds: 150, hint: "Mention over-fetching, schema definitions, round-trip overhead, and endpoints." },
    { prompt: "Explain JWT authentication. How do you store access and refresh tokens securely?", category: "Security", estimatedAnswerSeconds: 120, hint: "Talk about localStorage vs HttpOnly cookies, signature verification, and CSRF/XSS vectors." },
    { prompt: "How do you manage race conditions in distributed microservices?", category: "System Design", estimatedAnswerSeconds: 180, hint: "Discuss optimistic/pessimistic locking, distributed locks (Redis/Redlock), and idempotent APIs." }
  ],
  devops: [
    { prompt: "Explain the differences between Docker containers and virtual machines.", category: "Infrastructure", estimatedAnswerSeconds: 120, hint: "Talk about hypervisors, shared kernel space, memory footprints, and startup times." },
    { prompt: "What is a Kubernetes Pod, and how does it differ from a container?", category: "K8s Core", estimatedAnswerSeconds: 90, hint: "Mention pod namespaces, shared network interfaces, and volume sharing." },
    { prompt: "How do you set up a secure, zero-downtime CI/CD pipeline?", category: "CI/CD Orchestration", estimatedAnswerSeconds: 150, hint: "Talk about Blue/Green deployment, Canary releases, automated rollbacks, and unit testing." },
    { prompt: "What is Infrastructure as Code (IaC) and what are the benefits of Terraform?", category: "IaC Tools", estimatedAnswerSeconds: 120, hint: "Mention state files, declarative vs imperative configs, drift detection, and provider plugins." },
    { prompt: "Explain Prometheus scraping and how alerts are configured through Alertmanager.", category: "Monitoring", estimatedAnswerSeconds: 150, hint: "Discuss pull vs push metrics, threshold rules, and notification integration." }
  ]
};

export class InterviewService {
  async generateQuestions(userId, config) {
    const roleKey = this._mapRoleToKey(config.targetRole);
    const bank = QUESTION_BANK[roleKey] || QUESTION_BANK.backend;

    // Map and return questions structured as requested
    const questions = bank.map((q, idx) => ({
      id: `q_${idx + 1}`,
      prompt: q.prompt,
      category: q.category,
      difficulty: config.difficulty,
      estimatedAnswerSeconds: q.estimatedAnswerSeconds,
      hint: q.hint
    }));

    const session = await interviewRepository.createSession({
      userId,
      config,
      questions,
      answers: [],
      status: "in_progress"
    });

    return {
      sessionId: session._id,
      questions
    };
  }

  async submitAnswer(userId, sessionId, questionId, answerText, responseTimeSeconds) {
    const session = await interviewRepository.findByIdAndUser(sessionId, userId);
    if (!session) {
      throw new AppError("Interview session not found.", 404);
    }

    const question = session.questions.find(q => q.id === questionId);
    if (!question) {
      throw new AppError("Question not found in this session.", 404);
    }

    // Heuristically evaluate answer based on content length and response time
    const evaluation = this._evaluateAnswerHeuristically(question, answerText, responseTimeSeconds);

    // Store response item
    session.answers.push({
      question,
      answerText,
      responseTimeSeconds,
      evaluation
    });

    session.markModified("answers");
    await interviewRepository.save(session);

    return evaluation;
  }

  async completeSession(userId, sessionId) {
    const session = await interviewRepository.findByIdAndUser(sessionId, userId);
    if (!session) {
      throw new AppError("Interview session not found.", 404);
    }

    // Calculate aggregated results
    const answers = session.answers || [];
    const count = answers.length;

    let totalScore = 0;
    let totalTech = 0;
    let totalComm = 0;
    let totalConf = 0;
    let totalResponseTime = 0;

    answers.forEach(a => {
      totalScore += a.evaluation.overallRating;
      totalTech += a.evaluation.technicalAccuracy;
      totalComm += a.evaluation.communicationScore;
      totalConf += a.evaluation.confidenceScore;
      totalResponseTime += a.responseTimeSeconds;
    });

    const overallScore = count > 0 ? Math.round(totalScore / count) : 70;
    const technicalScore = count > 0 ? Math.round(totalTech / count) : 70;
    const communicationScore = count > 0 ? Math.round(totalComm / count) : 70;
    const confidenceLevel = count > 0 ? Math.round(totalConf / count) : 70;
    const averageResponseTimeSeconds = count > 0 ? Math.round(totalResponseTime / count) : 90;

    // Category scores
    const categoryScores = [
      { category: "Technical Accuracy", score: technicalScore },
      { category: "Communication & Clarity", score: communicationScore },
      { category: "Problem Solving", score: overallScore }
    ];

    // Timeline elements
    const confidenceTimeline = answers.map((a, idx) => ({
      questionIndex: idx + 1,
      confidenceScore: a.evaluation.confidenceScore
    }));

    const responseTimes = answers.map((a, idx) => ({
      questionIndex: idx + 1,
      seconds: a.responseTimeSeconds,
      estimatedSeconds: a.question.estimatedAnswerSeconds
    }));

    const report = {
      sessionId: session._id,
      overallScore,
      interviewReadiness: Math.round(overallScore * 0.95),
      confidenceLevel,
      technicalScore,
      communicationScore,
      averageResponseTimeSeconds,
      questionAccuracy: overallScore,
      categoryScores,
      confidenceTimeline,
      responseTimes,
      answers
    };

    session.status = "completed";
    session.report = report;
    await interviewRepository.save(session);

    return report;
  }

  async getHistory(userId) {
    const history = await interviewRepository.findHistoryByUserId(userId);
    return history.map(h => ({
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

  _mapRoleToKey(role) {
    const norm = role.toLowerCase();
    if (norm.includes("frontend") || norm.includes("design") || norm.includes("ui")) return "frontend";
    if (norm.includes("devops") || norm.includes("infra") || norm.includes("cloud")) return "devops";
    return "backend";
  }

  _evaluateAnswerHeuristically(question, answerText, responseTime) {
    const length = (answerText || "").trim().length;
    
    // Evaluate based on length of response
    let baseScore = 60;
    if (length > 250) baseScore += 25;
    else if (length > 100) baseScore += 15;
    else baseScore -= 15;

    // Time adjustments
    const ideal = question.estimatedAnswerSeconds;
    const diff = Math.abs(responseTime - ideal);
    if (diff < 30) baseScore += 5; // close to target estimate
    else if (responseTime > ideal * 2) baseScore -= 5; // took way too long

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
