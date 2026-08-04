/**
 * Mirrors the real Mongoose `Resume` model (server/src/models/Resume.js) —
 * not a guess. `atsScorecard` is the object produced by the ATS engine;
 * see types/ats.ts for its shape.
 */
export type ResumeStatus =
  | "Uploaded"
  | "Queued"
  | "Parsing"
  | "Analyzing"
  | "Completed"
  | "Failed"
  | "Archived";

export interface Resume {
  _id: string;
  userId: string;
  originalName: string;
  storedName: string;
  fileSize: number; // bytes
  extension: string; // e.g. ".pdf", ".docx"
  mimeType: string;
  storageUrl: string; // server-local path — not currently servable to the browser (no static file route yet)
  version: number;
  status: ResumeStatus;
  isLatest: boolean;
  uploadSource: string;
  rawText?: string;
  parsedProfile?: Record<string, unknown>;
  comparisonSummary?: string;
  language?: string;
  isDeleted: boolean;
  deletedAt?: string;
  atsScorecard?: import("./ats").AtsScorecard;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeOptimization {
  _id: string;
  resumeId?: string;
  targetRole?: string;
  targetCompany?: string;
  rewrittenSummary: string;
  rewrittenBullets: string[];
  quantifiedImpactSuggestions: string[];
  tailoringNotes: string[];
  createdAt?: string;
}

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  type: "skill" | "project" | "experience" | "certification";
  size?: number;
}

export interface KnowledgeGraphEdge {
  source: string;
  target: string;
  type: "uses";
}

export interface KnowledgeGraph {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
}

export interface ResumeChatMessage {
  _id: string;
  resumeId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface ResumeChatResponse {
  answer: string;
  sourceSnippets: Array<{ title: string; text: string }>;
  conversationId?: string;
}
