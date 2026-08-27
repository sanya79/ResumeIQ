import crypto from "crypto";
import { InterviewRepository } from "../repositories/interview.repository.js";
import { AppError } from "../utils/appError.js";

const interviewRepository = new InterviewRepository();

const QUESTION_BANK = {
  frontend: {
    TECHNICAL: [
      { prompt: "What is the Virtual DOM in React and how does the reconciliation algorithm (Fiber) work?", category: "React Core", estimatedAnswerSeconds: 120, hint: "Focus on diffing algorithm, key props, fiber tree traversal, and batching state updates." },
      { prompt: "Explain the event loop in JavaScript. How do microtasks (Promises) and macrotasks (setTimeout) differ?", category: "JS Core", estimatedAnswerSeconds: 120, hint: "Mention call stack, task queues, promise resolution timing, and Event Loop tick cycle." },
      { prompt: "How do you optimize frontend web application load time and improve Google Core Web Vitals (LCP, INP, CLS)?", category: "Web Performance", estimatedAnswerSeconds: 150, hint: "Discuss code-splitting, lazy loading, image webp formats, critical CSS rendering, and CDN caching." },
      { prompt: "What is the difference between CSS Flexbox and Grid? When would you use each layout model?", category: "CSS Architecture", estimatedAnswerSeconds: 90, hint: "Compare 1D vs 2D layout control, alignment, and responsive flow patterns." },
      { prompt: "Explain state management patterns in modern SPA frameworks (Redux Toolkit vs Zustand vs React Context).", category: "State Architecture", estimatedAnswerSeconds: 120, hint: "Compare re-render costs, global vs localized state, selector memoization, and boilerplate." },
      { prompt: "How do custom React Hooks work? Explain the rules of hooks and closure traps in useEffect.", category: "React Advanced", estimatedAnswerSeconds: 110, hint: "Discuss dependency arrays, stale closure traps, cleanup functions, and custom reusability." },
      { prompt: "What are Progressive Web Apps (PWAs)? Explain Service Workers and offline caching strategies.", category: "Browser Tech", estimatedAnswerSeconds: 130, hint: "Cover cache-first vs network-first strategies, manifest.json, and background sync." },
      { prompt: "Explain Cross-Site Scripting (XSS) and Content Security Policy (CSP) headers on the frontend.", category: "Web Security", estimatedAnswerSeconds: 120, hint: "Discuss sanitized inputs, DOMpurify, script-src CSP rules, and dangerous dangerouslySetInnerHTML." },
      { prompt: "What is TypeScript Generics and how do utility types (Partial, Pick, Omit, Record) improve code quality?", category: "TypeScript", estimatedAnswerSeconds: 115, hint: "Demonstrate generic type constraints T extends K and type safety in props interfaces." },
      { prompt: "Explain Web Accessibility (WCAG 2.1 AA) guidelines. How do ARIA labels and keyboard focus traps work?", category: "Accessibility", estimatedAnswerSeconds: 105, hint: "Mention color contrast, semantic HTML5 tags, screen reader compliance, and tabindex." }
    ],
    HR: [
      { prompt: "Tell me about a time you had to resolve a technical disagreement with a senior teammate.", category: "Collaboration", estimatedAnswerSeconds: 90, hint: "Use the STAR structure (Situation, Task, Action, Result) and focus on data-driven resolution." },
      { prompt: "Why do you want to specialize as a Frontend Engineer and what excites you about building UI/UX?", category: "Motivation", estimatedAnswerSeconds: 75, hint: "Connect your passion for user experience, modern web tech, and product design impact." },
      { prompt: "Describe how you stay up-to-date with fast-evolving web standards and framework releases.", category: "Continuous Learning", estimatedAnswerSeconds: 85, hint: "Mention blogs, RFCs, open-source projects, and side experiments." }
    ],
    BEHAVIOURAL: [
      { prompt: "Describe a high-pressure production bug you encountered on the frontend and how you debugged it.", category: "Ownership", estimatedAnswerSeconds: 120, hint: "Emphasize reproduction steps, Chrome DevTools profiling, hotfix deployment, and post-mortem." },
      { prompt: "Tell me about a project where you had to adapt quickly to a completely new framework or library.", category: "Adaptability", estimatedAnswerSeconds: 105, hint: "Focus on your learning workflow, documentation reading, and knowledge sharing." }
    ]
  },
  backend: {
    TECHNICAL: [
      { prompt: "What is event-driven architecture and how does the Node.js single-threaded event loop handle asynchronous I/O?", category: "Node.js Core", estimatedAnswerSeconds: 150, hint: "Mention libuv thread pool, phase queues, non-blocking I/O, and event emitters." },
      { prompt: "Explain SQL database indexing (B-Trees / Hash Indexes). What are the tradeoffs between read acceleration and write latency?", category: "Databases", estimatedAnswerSeconds: 120, hint: "Describe B-Tree lookup complexity, clustered vs non-clustered indexes, and write overhead." },
      { prompt: "Compare REST API architecture with GraphQL and gRPC. What factors influence your choice for a backend microservice?", category: "API Design", estimatedAnswerSeconds: 150, hint: "Discuss over-fetching, payload size, HTTP/2 streaming, schema type-safety, and latency." },
      { prompt: "How do you handle race conditions and concurrency issues in distributed backend systems?", category: "Distributed Systems", estimatedAnswerSeconds: 140, hint: "Talk about pessimistic vs optimistic locking, Redis distributed locks, and database transactions (ACID)." },
      { prompt: "Explain the CAP theorem. How do you choose between Consistency and Availability in DB design?", category: "System Architecture", estimatedAnswerSeconds: 120, hint: "Define Consistency, Availability, Partition Tolerance with real-world DB examples (PostgreSQL vs Cassandra)." },
      { prompt: "How do Rate Limiting algorithms (Token Bucket, Leaky Bucket, Sliding Window) protect backend APIs?", category: "API Security", estimatedAnswerSeconds: 125, hint: "Compare Redis memory footprint, burst handling, and HTTP 429 Too Many Requests responses." },
      { prompt: "Explain database connection pooling and how to prevent connection leaks under heavy traffic.", category: "Database Scaling", estimatedAnswerSeconds: 110, hint: "Discuss max connections limit, pool timeout configs, and socket lifecycle management." },
      { prompt: "What is Message Queue architecture (Kafka / RabbitMQ)? How do you ensure idempotency in consumer processing?", category: "Messaging", estimatedAnswerSeconds: 140, hint: "Explain at-least-once delivery, unique event IDs, deduplication tables, and dead-letter queues." },
      { prompt: "Explain garbage collection in V8 / Node.js. How do you detect and fix memory leaks in production?", category: "Node.js Profiling", estimatedAnswerSeconds: 130, hint: "Discuss heap snapshots, RSS memory, unhandled event listener leaks, and heap allocation metrics." },
      { prompt: "How do you implement database sharding and horizontal partitioning for massive scale?", category: "DB Architecture", estimatedAnswerSeconds: 145, hint: "Explain shard keys, consistent hashing, cross-shard queries, and rebalancing costs." }
    ],
    HR: [
      { prompt: "Walk me through a time you had to explain complex backend trade-offs to non-technical product managers.", category: "Communication", estimatedAnswerSeconds: 90, hint: "Focus on business metrics, risk assessment, cost vs speed, and clear analogies." },
      { prompt: "Describe a situation where you received constructive feedback on your code design and how you responded.", category: "Growth", estimatedAnswerSeconds: 100, hint: "Show openness to code reviews, refactoring habits, and continuous learning." },
      { prompt: "What is your approach to mentoring junior backend developers and conducting code reviews?", category: "Leadership", estimatedAnswerSeconds: 95, hint: "Focus on constructive comments, architectural guidance, and pair programming." }
    ],
    BEHAVIOURAL: [
      { prompt: "Tell me about a backend architectural mistake you made in the past and what you learned from it.", category: "Post-Mortem", estimatedAnswerSeconds: 120, hint: "Be honest about the failure, describe root-cause analysis (RCA), and defensive guards added." },
      { prompt: "Describe how you prioritize technical debt vs shipping new features under tight product deadlines.", category: "Prioritization", estimatedAnswerSeconds: 110, hint: "Discuss code smells, severity vs impact matrices, refactoring sprints, and team communication." }
    ]
  },
  fullstack: {
    TECHNICAL: [
      { prompt: "How do you design an end-to-end authentication flow using JWT tokens, HTTP-Only cookies, and Refresh Token rotation?", category: "Fullstack Security", estimatedAnswerSeconds: 150, hint: "Explain XSS & CSRF mitigation, token expiration windows, DB session tracking, and HTTPS." },
      { prompt: "Walk me through building a real-time collaborative feature (like Google Docs or Chat) using WebSockets or SSE.", category: "Realtime Systems", estimatedAnswerSeconds: 160, hint: "Discuss WebSocket handshake, connection heartbeat, scaling with Redis Pub/Sub, and state sync." },
      { prompt: "How do you optimize server-side rendering (SSR) vs static site generation (SSG) in Next.js applications?", category: "Fullstack Frameworks", estimatedAnswerSeconds: 140, hint: "Explain hydration, build-time compilation, revalidation strategies (ISR), and caching headers." },
      { prompt: "Explain how to structure a Type-Safe Fullstack Monorepo using Turborepo, tRPC/REST, and shared DTO packages.", category: "Monorepo Tech", estimatedAnswerSeconds: 145, hint: "Discuss shared tsconfig, Zod schema validation, yarn/pnpm workspaces, and build caching." },
      { prompt: "How do you manage zero-downtime database migrations with breaking schema changes in production?", category: "Fullstack Deployment", estimatedAnswerSeconds: 135, hint: "Explain expand-and-contract migration strategy, backwards-compatible API fields, and feature flags." }
    ],
    HR: [
      { prompt: "How do you balance user experience polish with backend architecture resilience in full-stack sprints?", category: "Product Mindset", estimatedAnswerSeconds: 100, hint: "Focus on user-centric priorities, API response times, loading UX, and error fallbacks." }
    ],
    BEHAVIOURAL: [
      { prompt: "Describe a feature you built from initial RFC specs all the way to production monitoring and analytics.", category: "End-to-End Ownership", estimatedAnswerSeconds: 130, hint: "Cover architecture design, database migration, API contracts, frontend integration, and telemetry." }
    ]
  },
  data_scientist: {
    TECHNICAL: [
      { prompt: "Explain the Bias-Variance Tradeoff in Machine Learning. How do you detect and mitigate overfitting?", category: "ML Theory", estimatedAnswerSeconds: 140, hint: "Discuss L1/L2 regularization, cross-validation, ensemble methods, and learning curves." },
      { prompt: "What is the difference between Gradient Boosting (XGBoost/LightGBM) and Random Forests?", category: "Algorithmic ML", estimatedAnswerSeconds: 130, hint: "Compare sequential boosting vs parallel bagging, tree depth, learning rate, and missing data handling." },
      { prompt: "How do you evaluate a classification model when class distribution is highly imbalanced (e.g. 99% vs 1%)?", category: "Evaluation Metrics", estimatedAnswerSeconds: 120, hint: "Explain why Accuracy fails, use Precision-Recall AUC, F1-Score, SMOTE resampling, and class weights." },
      { prompt: "Explain Principal Component Analysis (PCA) and dimensionality reduction. How do you choose the number of components?", category: "Unsupervised ML", estimatedAnswerSeconds: 135, hint: "Cover covariance matrices, eigenvectors/eigenvalues, and explained variance ratio scree plots." }
    ],
    HR: [
      { prompt: "How do you communicate ML model predictions and confidence intervals to business decision makers?", category: "Data Storytelling", estimatedAnswerSeconds: 100, hint: "Focus on translating model metrics into actionable business KPIs and ROI." }
    ],
    BEHAVIOURAL: [
      { prompt: "Describe a data science project where the initial data was noisy or incomplete. How did you clean and validate it?", category: "Data Wrangling", estimatedAnswerSeconds: 120, hint: "Highlight data imputation, outlier filtering, feature engineering, and pipeline automation." }
    ]
  },
  ml_engineer: {
    TECHNICAL: [
      { prompt: "How do you optimize Deep Learning model inference latency for low-latency production APIs (ONNX, TensorRT, Quantization)?", category: "MLOps", estimatedAnswerSeconds: 160, hint: "Discuss INT8/FP16 precision quantization, model pruning, batching, GPU acceleration, and ONNX Runtime." },
      { prompt: "Explain the Transformer architecture (Self-Attention mechanism, Query/Key/Value vectors). Why are transformers superior to RNNs?", category: "Deep Learning", estimatedAnswerSeconds: 150, hint: "Explain parallelized matrix multiplication, positional encoding, multi-head attention, and context window size." },
      { prompt: "How do you detect Data Drift and Concept Drift in deployed machine learning pipelines?", category: "Model Monitoring", estimatedAnswerSeconds: 130, hint: "Mention Kolmogorov-Smirnov test, PSI (Population Stability Index), retraining triggers, and Evidently AI." }
    ],
    HR: [
      { prompt: "Why do you want to build production ML systems rather than purely academic research models?", category: "Engineering Focus", estimatedAnswerSeconds: 90, hint: "Emphasize reliable deployments, throughput, real-time user impact, and robust software engineering." }
    ],
    BEHAVIOURAL: [
      { prompt: "Tell me about a time an ML model underperformed in production despite high validation scores.", category: "Debugging & MLOps", estimatedAnswerSeconds: 130, hint: "Discuss training-serving skew, data leakages, environment differences, and telemetry fixes." }
    ]
  },
  data_analyst: {
    TECHNICAL: [
      { prompt: "Explain Window Functions in SQL (ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD). Provide a practical analytical use case.", category: "SQL & Analytics", estimatedAnswerSeconds: 130, hint: "Contrast partition orderings, running totals, cohort churn calculations, and MoM growth metrics." },
      { prompt: "How do you design an A/B testing experiment? How do you calculate required sample size and statistical significance?", category: "Experimentation", estimatedAnswerSeconds: 140, hint: "Discuss p-values, confidence intervals, statistical power (1-beta), minimum detectable effect (MDE), and sample bias." }
    ],
    HR: [
      { prompt: "How do you handle conflicting data requests from executive stakeholders under tight timelines?", category: "Stakeholder Management", estimatedAnswerSeconds: 90, hint: "Explain impact prioritization, automated reporting dashboards, and transparent scope alignment." }
    ],
    BEHAVIOURAL: [
      { prompt: "Tell me about an actionable business insight you discovered in data that changed key company strategy.", category: "Business Impact", estimatedAnswerSeconds: 110, hint: "Detail hypothesis generation, metric analysis, presentation to leadership, and measurable revenue/user outcome." }
    ]
  },
  cloud: {
    TECHNICAL: [
      { prompt: "Compare Infrastructure as Code (IaC) tools like Terraform vs CloudFormation/Ansible. How do you structure modular Terraform environments?", category: "Cloud Automation", estimatedAnswerSeconds: 140, hint: "Explain state file locking (S3 + DynamoDB), module reusability, multi-region deployments, and drift detection." },
      { prompt: "How do you architect a high-availability, fault-tolerant VPC architecture on AWS/Azure across multiple Availability Zones?", category: "Cloud Networking", estimatedAnswerSeconds: 150, hint: "Discuss public/private subnets, NAT Gateways, Route Tables, Internet Gateways, Auto Scaling Groups, and Load Balancers." }
    ],
    HR: [
      { prompt: "How do you approach cloud cost optimization (FinOps) without compromising infrastructure performance?", category: "Cost Management", estimatedAnswerSeconds: 100, hint: "Discuss Reserved Instances/Savings Plans, auto-scaling policies, idle resource termination, and storage tiering." }
    ],
    BEHAVIOURAL: [
      { prompt: "Describe a cloud security audit or vulnerability patch you performed across production instances.", category: "Cloud Security", estimatedAnswerSeconds: 120, hint: "Cover IAM least-privilege policies, security groups, KMS encryption, and automated patch management." }
    ]
  },
  devops: {
    TECHNICAL: [
      { prompt: "Explain the differences between Docker containers and virtual machines. How does kernel isolation work?", category: "Containerization", estimatedAnswerSeconds: 120, hint: "Talk about namespaces, cgroups, shared host kernel space, image layers, and lightweight startup times." },
      { prompt: "What is a Kubernetes Pod, and how does Services (ClusterIP, NodePort, LoadBalancer) route traffic to Pods?", category: "Kubernetes Core", estimatedAnswerSeconds: 140, hint: "Explain label selectors, kube-proxy iptables/IPVS rules, ingress controllers, and DNS resolution." },
      { prompt: "How do you set up a secure, zero-downtime CI/CD deployment pipeline with automated rollback mechanisms?", category: "CI/CD Orchestration", estimatedAnswerSeconds: 150, hint: "Discuss Blue/Green deployments, Canary releases, health checks, gitops (ArgoCD/Flux), and rollback triggers." }
    ],
    HR: [
      { prompt: "Describe a time you had to balance urgent production incident resolution with longer-term platform reliability work.", category: "SRE Mindset", estimatedAnswerSeconds: 100, hint: "Highlight risk budget, clear escalation paths, and post-incident blameless retrospectives." }
    ],
    BEHAVIOURAL: [
      { prompt: "Tell me about a severe production outage you led the response for. How did you coordinate post-mortem mitigation?", category: "Incident Command", estimatedAnswerSeconds: 130, hint: "Detail communication channels, MTTR reduction, blameless post-mortem document, and action items." }
    ]
  },
  cybersecurity: {
    TECHNICAL: [
      { prompt: "Explain the OWASP Top 10 vulnerabilities (e.g. SQL Injection, XSS, CSRF, Broken Auth). How do you remediate each?", category: "Application Security", estimatedAnswerSeconds: 150, hint: "Discuss parameterized queries, Content Security Policy (CSP), SameSite cookies, and OAuth2/OIDC standards." },
      { prompt: "How does Public Key Infrastructure (PKI) and TLS 1.3 handshake work to secure data in transit?", category: "Cryptography & NetSec", estimatedAnswerSeconds: 140, hint: "Explain asymmetric key exchange (Diffie-Hellman), digital certificates, CA verification, and symmetric session encryption." }
    ],
    HR: [
      { prompt: "How do you promote a security-first culture among software developers without slowing down product delivery?", category: "Security Leadership", estimatedAnswerSeconds: 100, hint: "Discuss shift-left security testing, SAST/DAST automation in CI, security champions, and developer training." }
    ],
    BEHAVIOURAL: [
      { prompt: "Describe a security vulnerability or zero-day threat you discovered and successfully patched.", category: "Threat Response", estimatedAnswerSeconds: 125, hint: "Highlight vulnerability discovery, risk scoring (CVSS), hotfix deployment, and verification." }
    ]
  },
  ui_ux: {
    TECHNICAL: [
      { prompt: "Walk me through your UI/UX design process from initial user research to high-fidelity wireframes and design systems.", category: "Design Process", estimatedAnswerSeconds: 140, hint: "Cover user personas, journey mapping, Figma component architecture, design tokens, and usability testing." },
      { prompt: "How do you design for Web Content Accessibility Guidelines (WCAG 2.1 AA compliance)?", category: "Accessibility (a11y)", estimatedAnswerSeconds: 120, hint: "Discuss color contrast ratios, keyboard navigation, screen reader ARIA roles, and focus indicator visibility." }
    ],
    HR: [
      { prompt: "How do you handle feedback when a product manager or developer challenges your design decisions?", category: "Design Advocacy", estimatedAnswerSeconds: 95, hint: "Focus on user testing evidence, usability data, compromise, and iterative user-centered design." }
    ],
    BEHAVIOURAL: [
      { prompt: "Tell me about a redesign project where user feedback dramatically improved the product's core usability metrics.", category: "UX Impact", estimatedAnswerSeconds: 120, hint: "Highlight baseline metrics, user testing insights, design iterations, and final conversion/completion uplift." }
    ]
  }
};

export class InterviewService {
  async generateQuestions(userId, payload = {}) {
    const normalizedPayload = payload?.resumeId || payload?.config?.resumeId ? payload : { ...payload, ...(payload?.config || {}) };
    const resumeId = normalizedPayload?.resumeId ?? normalizedPayload?.config?.resumeId ?? null;
    const role = normalizedPayload?.role || normalizedPayload?.targetRole || normalizedPayload?.config?.targetRole || "Software Engineer";
    const type = this._normalizeInterviewType(normalizedPayload?.type || normalizedPayload?.config?.type || "TECHNICAL");
    const timed = Boolean(normalizedPayload?.timed ?? normalizedPayload?.config?.timed ?? true);
    const difficulty = normalizedPayload?.difficulty || normalizedPayload?.config?.difficulty || "Medium";
    const experienceLevel = normalizedPayload?.experienceLevel || normalizedPayload?.config?.experienceLevel || "1-2 Years";
    const roleKey = this._mapRoleToKey(role);
    const roleBank = QUESTION_BANK[roleKey] || QUESTION_BANK.backend;
    const typeBank = roleBank[type] || roleBank.TECHNICAL || QUESTION_BANK.backend.TECHNICAL;

    const fullPool = [
      ...typeBank,
      ...(roleBank.HR || QUESTION_BANK.backend.HR || []),
      ...(roleBank.BEHAVIOURAL || QUESTION_BANK.backend.BEHAVIOURAL || [])
    ];

    // Fetch user history to prevent duplicate questions across interviews for the same user
    let askedPrompts = new Set();
    try {
      const history = await interviewRepository.findHistoryByUserId(userId);
      history.forEach((h) => {
        (h.questions || []).forEach((q) => {
          if (q.prompt) askedPrompts.add(q.prompt);
        });
      });
    } catch {
      // ignore
    }

    // Filter out previously asked questions for this user
    let candidatePool = fullPool.filter((q) => !askedPrompts.has(q.prompt));
    if (candidatePool.length < 15) {
      candidatePool = fullPool; // fallback to full pool if candidate exhausted unique pool
    }

    // Shuffle candidate pool
    const shuffled = [...candidatePool].sort(() => Math.random() - 0.5);
    // Select 15 questions per interview session
    const selected = shuffled.slice(0, 15);

    const questions = selected.map((q, idx) => ({
      id: `q_${idx + 1}_${Date.now().toString(36)}`,
      prompt: q.prompt,
      category: q.category,
      difficulty,
      estimatedAnswerSeconds: q.estimatedAnswerSeconds || 120,
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
        targetRole: role,
        sessionTimerSeconds: 1200 // 20 minutes countdown
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
        questionCount: questions.length,
        sessionTimerSeconds: 1200
      },
      question: questions[0] ?? null,
      questions: questions
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

    const existingIndex = (session.answers || []).findIndex((a) => a.question.id === questionId);
    const newAnswerItem = { question, answerText, responseTimeSeconds, evaluation };

    if (existingIndex >= 0) {
      session.answers[existingIndex] = newAnswerItem;
    } else {
      session.answers.push(newAnswerItem);
    }

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
    const norm = (role || "").toLowerCase();
    if (norm.includes("frontend") || norm.includes("react") || norm.includes("web developer")) return "frontend";
    if (norm.includes("ui") || norm.includes("ux") || norm.includes("designer")) return "ui_ux";
    if (norm.includes("full stack") || norm.includes("fullstack")) return "fullstack";
    if (norm.includes("backend") || norm.includes("node") || norm.includes("java")) return "backend";
    if (norm.includes("data scientist") || norm.includes("science")) return "data_scientist";
    if (norm.includes("machine learning") || norm.includes("ml") || norm.includes("ai")) return "ml_engineer";
    if (norm.includes("data analyst") || norm.includes("analytics")) return "data_analyst";
    if (norm.includes("cloud") || norm.includes("aws") || norm.includes("azure")) return "cloud";
    if (norm.includes("devops") || norm.includes("sre") || norm.includes("infra")) return "devops";
    if (norm.includes("cyber") || norm.includes("security")) return "cybersecurity";
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
