import test from "node:test";
import assert from "node:assert/strict";
import { AtsScoringService } from "./atsScoringService.js";
import { RecruiterSimulationService } from "./recruiterSimulationService.js";

test("builds structured ATS breakdown with human-readable reasons", async () => {
  const service = new AtsScoringService();
  const result = await service.scoreResumeText(
    "Senior software engineer with React, Node.js, Docker, and AWS experience. Built distributed systems and led API migrations.",
    "Backend engineer with React, Docker, Kubernetes, and AWS"
  );

  assert.ok(result.overall >= 0 && result.overall <= 100);
  assert.ok(result.breakdown.formatting);
  assert.ok(result.breakdown.keywords);
  assert.ok(result.breakdown.sections);
  assert.ok(result.breakdown.readability);
  assert.ok(result.improvementSuggestions.length >= 1);
  const combinedReasons = Object.values(result.breakdown).flatMap((entry) => entry.reasons);
  assert.ok(combinedReasons.some((reason) => reason.includes("Missing") || reason.includes("Multi-column") || reason.includes("Readability")));
});

test("builds a recruiter simulation summary from resume signals", async () => {
  const service = new RecruiterSimulationService();
  const result = await service.simulateRecruiterReview(
    "Senior software engineer with React, Node.js, Docker, and AWS experience. Built distributed systems and led API migrations.",
    "Backend engineer with React, Docker, Kubernetes, and AWS"
  );

  assert.ok(result.hireProbability >= 0 && result.hireProbability <= 100);
  assert.ok(result.estimatedReadTime >= 30);
  assert.ok(result.strengths.length >= 1);
  assert.ok(result.weaknesses.length >= 1);
  assert.ok(result.explanationBullets.length >= 1);
});
