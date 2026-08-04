import test from "node:test";
import assert from "node:assert/strict";
import { MockLLMChatService } from "./llmChat.service.js";

test("returns an answer grounded in retrieved context", async () => {
  const service = new MockLLMChatService();
  const result = await service.generateReply({
    message: "What are my top strengths?",
    contextSnippets: [{ title: "ATS strengths", text: "Strong React experience and AWS delivery" }],
  });

  assert.ok(result.answer.includes("resume context") || result.answer.includes("relevant evidence") || result.answer.includes("ATS"));
});
