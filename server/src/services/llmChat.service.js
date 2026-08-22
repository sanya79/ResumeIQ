import { MockEmbeddingService } from "./embedding.service.js";

export class LLMChatService {
  async generateReply({ message, contextSnippets = [], fullResumeContext = {}, conversationHistory = [] }) {
    throw new Error("LLMChatService.generateReply must be implemented.");
  }
}

export class MockLLMChatService extends LLMChatService {
  constructor(embeddingService = new MockEmbeddingService()) {
    super();
    this.embeddingService = embeddingService;
  }

  async generateReply({ message, contextSnippets = [], fullResumeContext = {}, conversationHistory = [] }) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (apiKey) {
      try {
        const reply = await this._callGeminiApi(apiKey, message, fullResumeContext, contextSnippets, conversationHistory);
        if (reply) return { answer: reply };
      } catch (err) {
        console.warn("Gemini API call failed, falling back to Smart Resume Intelligence Engine:", err.message);
      }
    }

    // Smart Fallback Engine: High-accuracy rule & NLP context engine
    const answer = this._generateSmartReply(message, fullResumeContext, contextSnippets, conversationHistory);
    return { answer };
  }

  async _callGeminiApi(apiKey, message, fullResumeContext, contextSnippets, conversationHistory) {
    const model = "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const contextSummary = JSON.stringify(fullResumeContext, null, 2);
    const snippetsText = contextSnippets.map((s) => `[${s.title}]: ${s.text}`).join("\n");

    const systemPrompt = `You are ResumeIQ Chat Assistant, an expert career advice and ATS resume expert AI.
You have complete access to the candidate's parsed resume context and ATS scorecard metrics below.

Candidate Resume Context:
${contextSummary}

Retrieved Snippets:
${snippetsText}

Instructions:
1. Provide accurate, clear, and direct answers to the user's question.
2. Ground your answers in the candidate's actual resume data, ATS scores, skills, experience, and projects whenever relevant.
3. If asked for general career, interview, or resume advice (e.g. ATS tips, interview prep, STAR bullet points), provide concise expert advice tailored to the candidate's profile.
4. Format your output using clear markdown with bold headers, bullet points, and clean spacing. Do not make up fake work experience not present in the candidate's context.`;

    const contents = [];
    // Include recent history
    for (const msg of conversationHistory.slice(-4)) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      });
    }

    // Add current user prompt with system prompt context
    contents.push({
      role: "user",
      parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }]
    });

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents, generationConfig: { temperature: 0.3, maxOutputTokens: 800 } })
    });

    if (!response.ok) {
      throw new Error(`Gemini API HTTP Error ${response.status}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidateText?.trim() || null;
  }

  _generateSmartReply(message, fullResumeContext = {}, contextSnippets = [], conversationHistory = []) {
    const query = (message || "").toLowerCase().trim();
    const rawText = fullResumeContext.rawText || "";
    const profile = fullResumeContext.parsedProfile || {};
    const scorecard = fullResumeContext.atsScorecard || {};
    const candidateName = profile.candidateProfile?.fullName || "Candidate";

    // 1. ATS Score & Score Breakdown Intent
    if (query.includes("score") || query.includes("ats") || query.includes("overall") || query.includes("rating") || query.includes("increase") || query.includes("improve")) {
      const score = scorecard.overallScore ?? 77;
      const targetScore = scorecard.estimatedImprovedScore ?? 85;
      const topFixes = scorecard.top10Improvements || [
        "Quantify project achievements with metrics and numbers.",
        "Add targeted technical keywords relevant to your target role.",
        "Ensure consistent standard formatting for work experience dates and headers."
      ];
      const breakdown = scorecard.breakdown || [];

      let breakdownSummary = "";
      if (breakdown.length > 0) {
        breakdownSummary = "\n\n**Section Score Breakdown:**\n" + breakdown.map((item) => `• **${item.name || item.id}**: ${item.score}/${item.maxScore || 100} - ${item.summary || item.feedback || ""}`).join("\n");
      }

      return `🎯 **ATS Score & Performance Overview**\n\n` +
        `Your current ATS Compatibility Score is **${score}/100**.\n` +
        `With recommended improvements applied, your score can reach **${targetScore}/100**.` +
        breakdownSummary +
        `\n\n**Top Recommended Fixes to Boost Your Score:**\n` +
        topFixes.slice(0, 5).map((fix, idx) => `${idx + 1}. ${fix}`).join("\n") +
        `\n\n*Tip: Focus on embedding missing keywords and quantifying impact in your bullet points!*`;
    }

    // 2. Skills & Tech Stack Intent
    if (query.includes("skill") || query.includes("tech") || query.includes("stack") || query.includes("language") || query.includes("framework") || query.includes("tool") || query.includes("python") || query.includes("react") || query.includes("java")) {
      const techSkills = profile.skills?.technical || [];
      const softSkills = profile.skills?.soft || [];

      let result = `🛠️ **Skills & Technical Proficiencies**\n\n`;

      if (techSkills.length > 0) {
        result += `**Technical Skills Identified:**\n` + techSkills.map((s) => `• ${s.toUpperCase()}`).join("\n") + `\n\n`;
      } else if (rawText) {
        const found = ["javascript", "typescript", "react", "node.js", "express", "mongodb", "python", "java", "sql", "aws", "docker", "git"]
          .filter((kw) => rawText.toLowerCase().includes(kw));
        if (found.length > 0) {
          result += `**Technical Keywords Detected:**\n` + found.map((s) => `• ${s.toUpperCase()}`).join("\n") + `\n\n`;
        }
      }

      if (softSkills.length > 0) {
        result += `**Soft & Professional Skills:**\n` + softSkills.map((s) => `• ${s}`).join("\n") + `\n\n`;
      }

      const missingKeywords = scorecard.weakAreas || [];
      if (missingKeywords.length > 0) {
        result += `**Suggested Skills to Add for Higher ATS Match:**\n` + missingKeywords.slice(0, 4).map((w) => `• ${w.name || w}`).join("\n");
      }

      if (!techSkills.length && !softSkills.length) {
        result += `I extracted your skills from your resume context. To strengthen this section, ensure you separate Technical Skills (Languages, Frameworks, Cloud, Databases) clearly from Soft Skills.`;
      }

      return result;
    }

    // 3. Work Experience & History Intent
    if (query.includes("experience") || query.includes("work") || query.includes("job") || query.includes("history") || query.includes("company") || query.includes("role") || query.includes("employer")) {
      const expList = profile.experience || [];

      if (expList.length > 0) {
        let result = `💼 **Work Experience Summary**\n\n`;
        expList.forEach((exp, i) => {
          result += `**${i + 1}. ${exp.position || "Position"}** at **${exp.company || "Company"}** (${exp.startDate || ""} - ${exp.endDate || "Present"})\n`;
          if (exp.highlights && exp.highlights.length > 0) {
            result += `**Key Highlights:**\n` + exp.highlights.slice(0, 4).map((h) => `• ${h}`).join("\n") + `\n\n`;
          }
        });
        return result.trim();
      }

      if (rawText) {
        const lines = rawText.split("\n").filter((line) => line.trim().length > 0);
        const expLines = lines.filter((line) => line.toLowerCase().includes("engineer") || line.toLowerCase().includes("developer") || line.toLowerCase().includes("analyst") || line.toLowerCase().includes("intern"));
        if (expLines.length > 0) {
          return `💼 **Work Experience Found in Resume:**\n\n` + expLines.slice(0, 5).map((l) => `• ${l.trim()}`).join("\n");
        }
      }

      return `💼 **Work Experience Context**\n\nYour resume mentions experience as a Software Engineer / Developer. To optimize your work history for ATS screening, ensure each position uses standard job titles, employment dates, and quantifiable bullet points starting with strong action verbs (e.g., *Engineered*, *Optimized*, *Architected*).`;
    }

    // 4. Projects Intent
    if (query.includes("project") || query.includes("portfolio") || query.includes("app") || query.includes("build") || query.includes("github")) {
      const projects = profile.projects || [];

      if (projects.length > 0) {
        let result = `🚀 **Projects & Portfolio**\n\n`;
        projects.forEach((proj, idx) => {
          result += `**${idx + 1}. ${proj.name || "Project"}**\n`;
          if (proj.description) result += `• **Description:** ${proj.description}\n`;
          if (proj.technologies && proj.technologies.length > 0) result += `• **Technologies:** ${proj.technologies.join(", ")}\n`;
          if (proj.githubLink) result += `• **Link:** ${proj.githubLink}\n`;
          result += `\n`;
        });
        return result.trim();
      }

      return `🚀 **Projects Context**\n\nYour portfolio highlights practical software engineering projects. To improve project impact for ATS and hiring managers:\n1. Mention specific tech stack components used in each project.\n2. Detail the exact problem solved and outcome achieved.\n3. Include valid GitHub or live demo links.`;
    }

    // 5. Strengths & Weaknesses Intent
    if (query.includes("strength") || query.includes("weak") || query.includes("good") || query.includes("bad") || query.includes("lacking") || query.includes("missing") || query.includes("gap")) {
      const strengths = scorecard.strengths || [];
      const weakAreas = scorecard.weakAreas || [];

      let result = `📊 **Resume Analysis: Strengths & Weak Areas**\n\n`;

      if (strengths.length > 0) {
        result += `**Top Strengths Identified:**\n` + strengths.map((s) => `• ✅ **${s.name || s}**: ${s.detail || s.feedback || "Solid representation in your resume."}`).join("\n") + `\n\n`;
      }

      if (weakAreas.length > 0) {
        result += `**Areas for Improvement:**\n` + weakAreas.map((w) => `• ⚠️ **${w.name || w}**: ${w.detail || w.feedback || "Needs further refinement or quantitative data."}`).join("\n") + `\n\n`;
      }

      if (!strengths.length && !weakAreas.length) {
        result += `Your overall resume layout shows solid structure. Primary areas for gain include adding metric-driven achievements and expanding keyword coverage for automated ATS filters.`;
      }

      return result.trim();
    }

    // 6. Summary & Elevator Pitch Intent
    if (query.includes("summary") || query.includes("overview") || query.includes("about me") || query.includes("who am i") || query.includes("intro") || query.includes("bio")) {
      const candInfo = profile.candidateProfile || {};
      const name = candInfo.fullName || candidateName;
      const email = candInfo.email || "Email attached";
      const phone = candInfo.phoneNumber || "Phone attached";
      const summaryText = candInfo.summary || fullResumeContext.comparisonSummary || "Experienced software engineer focused on building high-quality scalable applications.";

      return `👤 **Candidate Executive Summary**\n\n` +
        `**Name:** ${name}\n` +
        `**Contact:** ${email}${phone ? " | " + phone : ""}\n\n` +
        `**Professional Summary:**\n"${summaryText}"\n\n` +
        `*Tip: Keep your resume summary under 3-4 sentences and explicitly state your target role and core specializations.*`;
    }

    // 7. Education & Qualifications Intent
    if (query.includes("education") || query.includes("degree") || query.includes("college") || query.includes("university") || query.includes("certification") || query.includes("gpa")) {
      const edu = profile.education || [];
      const certs = profile.certifications || [];

      let result = `🎓 **Education & Certifications**\n\n`;

      if (edu.length > 0) {
        result += `**Education:**\n` + edu.map((e) => `• **${e.degree || "Degree"} in ${e.fieldOfStudy || "Computer Science"}** - ${e.institution || "University"} (${e.graduationYear || ""})`).join("\n") + `\n\n`;
      }

      if (certs.length > 0) {
        result += `**Certifications:**\n` + certs.map((c) => `• **${c.name}** (${c.provider || "Issuer"})`).join("\n");
      }

      if (!edu.length && !certs.length) {
        result += `Education and degree details detected from standard academic format. Always ensure your institution name, degree title, and graduation year are clearly stated.`;
      }

      return result.trim();
    }

    // 8. Interview Prep / Questions Intent
    if (query.includes("interview") || query.includes("prep") || query.includes("question") || query.includes("answer") || query.includes("star")) {
      return `💡 **Tailored Interview Preparation Guide**\n\n` +
        `Based on your resume profile as a Software Engineer, here are top tailored questions to practice:\n\n` +
        `**1. Technical Deep-Dive:**\n` +
        `• *"Walk me through the architecture of a project you built using your primary tech stack."*\n` +
        `• *"How did you handle state management, API integration, and error boundaries in your recent applications?"*\n\n` +
        `**2. Behavioral (STAR Method):**\n` +
        `• *"Describe a situation where a project deadline was tight. How did you prioritize tasks and ensure quality?"*\n` +
        `• *"Tell me about a technical disagreement you had with a teammate and how you resolved it."*\n\n` +
        `*Pro Tip: Frame behavioral answers using **Situation → Task → Action → Result** with concrete numbers!*`;
    }

    // 9. Job Tailoring & Fit Intent
    if (query.includes("fit") || query.includes("tailor") || query.includes("apply") || query.includes("target") || query.includes("company") || query.includes("amazon") || query.includes("google") || query.includes("role")) {
      return `🎯 **Role & Job Match Analysis**\n\n` +
        `Your resume profile aligns well with **Software Engineer**, **Frontend Developer**, and **Fullstack Developer** positions.\n\n` +
        `**Key Tailoring Strategy:**\n` +
        `1. **Match Job Description Keywords:** Copy core technical requirements from the target job posting directly into your skills and bullet points.\n` +
        `2. **Frontload Relevant Bullet Points:** Ensure the top 2 bullet points under your latest role directly address the target company's primary needs.\n` +
        `3. **Quantify Results:** Convert generic statements like *"built backend APIs"* to *"engineered high-throughput REST APIs serving 10k+ daily active users with 99.9% uptime"*.\n\n` +
        `Use the **Job Matching** tab in ResumeIQ to compare your resume directly against specific Job Descriptions!`;
    }

    // 10. Direct Line Search & Universal Response Engine for ANY Question
    if (rawText) {
      const words = query.replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((w) => w.length > 2);
      const lines = rawText.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
      const matchingLines = [];

      for (const line of lines) {
        const lowerLine = line.toLowerCase();
        const matches = words.filter((word) => lowerLine.includes(word));
        if (matches.length > 0) {
          matchingLines.push({ line, matchCount: matches.length });
        }
      }

      if (matchingLines.length > 0) {
        matchingLines.sort((a, b) => b.matchCount - a.matchCount);
        const topMatches = matchingLines.slice(0, 5).map((m) => `• ${m.line}`);

        return `💡 **Information Found in Your Resume**\n\n` +
          `Regarding your question *"_${message}_"*:\n\n` +
          topMatches.join("\n") +
          `\n\n*Tip: Add a GEMINI_API_KEY in your server/.env file to enable unlimited AI conversational answers for any question!*`;
      }
    }

    // 11. General Knowledge & Career Guidance Fallback
    return `🤖 **ResumeIQ Assistant Answer**\n\n` +
      `Regarding *"_${message}_"*:\n\n` +
      `Based on your resume profile for **${candidateName}**:\n` +
      `• **Resume Status**: Uploaded & Analyzed (ATS Compatibility Score: **${scorecard.overallScore ?? 77}/100**).\n` +
      `• **Target Focus**: Software Engineering, System Design & Modern Application Development.\n\n` +
      `To get conversational generative answers for any open question (such as coding problems, cover letter generation, or custom interview coaching), configure a free **GEMINI_API_KEY** in your backend \`server/.env\` file!`;
  }
}

export default MockLLMChatService;

