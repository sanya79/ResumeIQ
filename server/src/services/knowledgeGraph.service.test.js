import test from "node:test";
import assert from "node:assert/strict";
import { buildResumeKnowledgeGraph } from "./knowledgeGraph.service.js";

test("buildResumeKnowledgeGraph links resume entities by skill relationships", () => {
  const graph = buildResumeKnowledgeGraph({
    skills: {
      technical: ["React", "Node.js", "AWS"],
      soft: ["Leadership"],
    },
    projects: [
      { name: "Portfolio App", technologies: ["React", "Node.js"] },
    ],
    experience: [
      { position: "Senior Engineer", highlights: ["Built React dashboards on AWS"] },
    ],
    certifications: [
      { name: "AWS Certified Developer" },
    ],
  });

  assert.ok(graph.nodes.some((node) => node.type === "skill" && node.label === "React"));
  assert.ok(graph.edges.some((edge) => edge.source.includes("project") && edge.target === "skill:React"));
  assert.ok(graph.edges.some((edge) => edge.source.includes("experience") && edge.target === "skill:AWS"));
  assert.ok(graph.edges.some((edge) => edge.source.includes("certification") && edge.target === "skill:AWS"));
});
