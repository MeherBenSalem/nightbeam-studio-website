import "server-only";
import type { KnowledgeChunk, KnowledgeDoc } from "@/lib/chatbot/types";

// Lightweight BM25 retrieval over chunked markdown docs. No external
// services — the corpus is small and keyword scoring is sufficient.

const STOP_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being", "to", "of", "for",
  "in", "on", "at", "and", "or", "but", "with", "without", "how", "do", "does", "did",
  "can", "could", "would", "should", "will", "i", "you", "your", "my", "me", "we", "our",
  "they", "their", "them", "he", "she", "it", "its", "what", "why", "when", "where",
  "which", "who", "whom", "this", "that", "these", "those", "there", "here", "from",
  "by", "as", "not", "no", "yes", "if", "then", "than", "so", "too", "very", "just",
  "about", "into", "out", "up", "down", "off", "over", "under", "again", "further",
  "once", "also", "get", "got", "make", "made", "use", "used", "using", "have", "has",
  "had", "does", "some", "any", "all", "each", "few", "more", "most", "other", "such",
  "only", "own", "same", "both", "between", "after", "before", "during", "while",
  "because", "until", "against", "through", "among", "please", "tell", "know", "need",
]);

export function tokenize(text: string): string[] {
  const matches = text.toLowerCase().match(/[a-z0-9][a-z0-9._-]*/g) ?? [];
  return matches.filter((token) => token.length > 1 && !STOP_WORDS.has(token) && !/^\d+$/.test(token));
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

const MAX_CHUNK_CHARS = 3200; // ≈ 800 tokens

/**
 * Splits a markdown doc into sections (heading-delimited), sub-splitting
 * oversized sections into paragraph blocks.
 */
export function chunkDoc(doc: KnowledgeDoc): KnowledgeChunk[] {
  const lines = doc.content.split("\n");
  const chunks: KnowledgeChunk[] = [];
  let heading = "";
  let section: string[] = [];

  const flush = () => {
    const text = section.join("\n").trim();
    if (!text) return;
    if (text.length <= MAX_CHUNK_CHARS) {
      chunks.push(makeChunk(doc, heading, text));
      return;
    }
    // Sub-split oversized sections on blank lines.
    const paragraphs = text.split(/\n{2,}/);
    let buffer = "";
    for (const paragraph of paragraphs) {
      if ((buffer + "\n\n" + paragraph).length > MAX_CHUNK_CHARS && buffer) {
        chunks.push(makeChunk(doc, heading, buffer));
        buffer = paragraph;
      } else {
        buffer = buffer ? `${buffer}\n\n${paragraph}` : paragraph;
      }
    }
    if (buffer) {
      // A single paragraph can still exceed the cap — hard split it.
      if (buffer.length > MAX_CHUNK_CHARS) {
        let rest = buffer;
        while (rest.length > MAX_CHUNK_CHARS) {
          let cut = rest.lastIndexOf(" ", MAX_CHUNK_CHARS);
          if (cut < MAX_CHUNK_CHARS / 2) cut = MAX_CHUNK_CHARS;
          chunks.push(makeChunk(doc, heading, rest.slice(0, cut)));
          rest = rest.slice(cut).trim();
        }
        if (rest) chunks.push(makeChunk(doc, heading, rest));
      } else {
        chunks.push(makeChunk(doc, heading, buffer));
      }
    }
  };

  for (const line of lines) {
    if (/^#{1,6}\s+/.test(line)) {
      flush();
      heading = line.replace(/^#+\s*/, "").trim();
      section = [];
      continue;
    }
    section.push(line);
  }
  flush();

  if (chunks.length === 0) {
    chunks.push(makeChunk(doc, "", doc.content.trim()));
  }
  return chunks;
}

function makeChunk(doc: KnowledgeDoc, heading: string, content: string): KnowledgeChunk {
  return {
    docId: doc.id,
    source: doc.source,
    slug: doc.slug,
    title: doc.title,
    heading,
    content,
    tokens: estimateTokens(content),
  };
}

interface CorpusStats {
  n: number;
  avgdl: number;
  df: Map<string, number>;
}

function buildStats(chunks: KnowledgeChunk[]): CorpusStats {
  const df = new Map<string, number>();
  let totalLength = 0;
  for (const chunk of chunks) {
    totalLength += chunk.content.length;
    const seen = new Set(tokenize(`${chunk.title} ${chunk.heading} ${chunk.content}`));
    for (const token of seen) {
      df.set(token, (df.get(token) ?? 0) + 1);
    }
  }
  return { n: chunks.length, avgdl: chunks.length ? totalLength / chunks.length : 1, df };
}

const K1 = 1.5;
const B = 0.75;

function scoreChunk(queryTokens: string[], chunk: KnowledgeChunk, stats: CorpusStats): number {
  const dl = chunk.content.length;
  const norm = K1 * (1 - B + B * (dl / stats.avgdl));
  let score = 0;
  for (const token of queryTokens) {
    const df = stats.df.get(token) ?? 0;
    const idf = Math.log(1 + (stats.n - df + 0.5) / (df + 0.5));
    const tf = (chunk.content.toLowerCase().match(new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length;
    // Field boost: title and heading matches count double.
    const headerBoost = new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(
      `${chunk.title} ${chunk.heading}`,
    )
      ? 2
      : 1;
    if (tf > 0) {
      score += idf * ((tf * (K1 + 1)) / (tf + norm)) * headerBoost;
    }
  }
  return score;
}

export function retrieveChunks(query: string, chunks: KnowledgeChunk[], topK = 6): KnowledgeChunk[] {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0 || chunks.length === 0) return [];
  const stats = buildStats(chunks);
  return chunks
    .map((chunk) => ({ chunk, score: scoreChunk(queryTokens, chunk, stats) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((entry) => entry.chunk);
}

export function chunkAll(docs: KnowledgeDoc[]): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];
  for (const doc of docs) {
    chunks.push(...chunkDoc(doc));
  }
  return chunks;
}
