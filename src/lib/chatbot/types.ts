// Shared types for the NightBeam Assistant chatbot.

export type ChatTier = "anonymous" | "free" | "pro";

export interface ChatQuotaResult {
  allowed: boolean;
  tier: ChatTier;
  used: number;
  limit: number | null; // null = unlimited (pro)
  remaining: number;
  reason?: "anonymous_limit" | "window_limit" | "burst_limit" | "concurrency" | "ok";
}

export interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

export interface TopicVerdict {
  allowed: boolean;
  reason: string;
}

export interface ChatUsage {
  promptTokens: number;
  completionTokens: number;
}

export interface KnowledgeDoc {
  id: string;
  source: string;
  slug: string;
  title: string;
  content: string;
  filePath: string | null;
}

export interface KnowledgeChunk {
  docId: string;
  source: string;
  slug: string;
  title: string;
  heading: string;
  content: string;
  tokens: number;
}
