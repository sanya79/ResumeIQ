import test from "node:test";
import assert from "node:assert/strict";
import { MockLLMChatService } from "./llmChat.service.js";

test("returns detailed ATS score and fixes when asking about score", async () => {
  const service = new MockLLMChatService();
  const result = await service.generateReply({
    message: "What is my ATS score and how to improve?",
    fullResumeContext: {
      atsScorecard: {
        overallScore: 82,
        estimatedImprovedScore: 92,
        top10Improvements: ["Add unit testing keywords", "Quantify bullet points"]
      }
    }
  });

  assert.ok(result.answer.includes("82"));
  assert.ok(result.answer.includes("ATS Score"));
});

test("returns technical skills when asking about skills", async () => {
  const service = new MockLLMChatService();
  const result = await service.generateReply({
    message: "What are my main technical skills?",
    fullResumeContext: {
      parsedProfile: {
        skills: { technical: ["javascript", "react", "node.js"], soft: ["leadership"] }
      }
    }
  });

  assert.ok(result.answer.includes("JAVASCRIPT"));
  assert.ok(result.answer.includes("REACT"));
});

test("returns tailored interview questions when asking about interview prep", async () => {
  const service = new MockLLMChatService();
  const result = await service.generateReply({
    message: "How should I prepare for a software engineer interview?",
    fullResumeContext: {
      parsedProfile: { candidateProfile: { fullName: "Jane Doe" } }
    }
  });

  assert.ok(result.answer.includes("Interview Preparation"));
  assert.ok(result.answer.includes("STAR"));
});

