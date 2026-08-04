import test from "node:test";
import assert from "node:assert/strict";
import { GitHubPortfolioService } from "./githubPortfolio.service.js";
import { MockLLMOptimizerService } from "./llmOptimizer.service.js";

test("returns a valid portfolio analysis summary for a username", async () => {
  const service = new GitHubPortfolioService();
  const analysis = await service.connect("octocat");

  assert.ok(analysis.portfolioScore >= 0 && analysis.portfolioScore <= 100);
  assert.ok(analysis.languageDistribution.length >= 0);
  assert.ok(analysis.contributionSummary.length > 0);
});

test("applies company-specific tailoring for preset companies", async () => {
  const service = new MockLLMOptimizerService();
  const result = await service.optimizeResume({
    resumeText: "Built distributed systems and APIs.",
    targetRole: "Software Engineer",
    targetCompany: "Google",
  });

  assert.ok(result.tailoringNotes.some((note) => note.toLowerCase().includes("google")));
  assert.ok(result.rewrittenSummary.toLowerCase().includes("scalable"));
});
