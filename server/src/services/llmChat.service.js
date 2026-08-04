import { MockEmbeddingService } from "./embedding.service.js";

export class LLMChatService {
  async generateReply({ message, contextSnippets = [], conversationHistory = [] }) {
    throw new Error("LLMChatService.generateReply must be implemented.");
  }
}

export class MockLLMChatService extends LLMChatService {
  constructor(embeddingService = new MockEmbeddingService()) {
    super();
    this.embeddingService = embeddingService;
  }

  async generateReply({ message, contextSnippets = [], conversationHistory = [] }) {
    const normalizedMessage = (message || "").toLowerCase();
    const contextText = contextSnippets.map((snippet) => snippet.text).join("\n");
    const contextTokens = contextText ? contextText.toLowerCase().split(/\s+/).filter(Boolean) : [];
    const relevantTerms = normalizedMessage.split(/\s+/).filter(Boolean).slice(0, 8);
    const matchedTerms = relevantTerms.filter((term) => contextTokens.includes(term));

    const answer = [
      "I can answer strictly from the resume context I retrieved.",
      contextSnippets.length > 0
        ? `The most relevant evidence I found mentions ${contextSnippets.slice(0, 2).map((snippet) => snippet.title).join(" and ")}.`
        : "I couldn't find strong resume context for that question yet.",
      matchedTerms.length > 0
        ? `Your question appears to relate to ${matchedTerms.slice(0, 3).join(", ")}.`
        : "I can help you explore achievements, skills, ATS strengths, or gaps from the resume.",
      conversationHistory.length > 0
        ? "I also use your recent conversation history to keep the response aligned with the ongoing discussion."
        : "Ask me about your experience, target role fit, or ATS improvements.",
    ].join(" ");

    return { answer };
  }
}

export default MockLLMChatService;
