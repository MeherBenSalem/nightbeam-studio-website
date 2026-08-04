const STOP_WORDS = /* @__PURE__ */ new Set([
  "the",
  "a",
  "an",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "to",
  "of",
  "for",
  "in",
  "on",
  "at",
  "and",
  "or",
  "but",
  "with",
  "without",
  "how",
  "do",
  "does",
  "did",
  "can",
  "could",
  "would",
  "should",
  "will",
  "i",
  "you",
  "your",
  "my",
  "me",
  "we",
  "our",
  "they",
  "their",
  "them",
  "he",
  "she",
  "it",
  "its",
  "what",
  "why",
  "when",
  "where",
  "which",
  "who",
  "whom",
  "this",
  "that",
  "these",
  "those",
  "there",
  "here",
  "from",
  "by",
  "as",
  "not",
  "no",
  "yes",
  "if",
  "then",
  "than",
  "so",
  "too",
  "very",
  "just",
  "about",
  "into",
  "out",
  "up",
  "down",
  "off",
  "over",
  "under",
  "again",
  "further",
  "once",
  "also",
  "get",
  "got",
  "make",
  "made",
  "use",
  "used",
  "using",
  "have",
  "has",
  "had",
  "does",
  "some",
  "any",
  "all",
  "each",
  "few",
  "more",
  "most",
  "other",
  "such",
  "only",
  "own",
  "same",
  "both",
  "between",
  "after",
  "before",
  "during",
  "while",
  "because",
  "until",
  "against",
  "through",
  "among",
  "please",
  "tell",
  "know",
  "need"
]);
function normalizeToken(token) {
  let t = token.toLowerCase();
  if (t.length > 4 && t.endsWith("ies")) return `${t.slice(0, -3)}y`;
  if (t.length > 3 && t.endsWith("s") && !/(ss|us|is|as|os)$/.test(t)) return t.slice(0, -1);
  return t;
}
function tokenize(text) {
  const matches = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  return matches.filter((token) => token.length > 1 && !STOP_WORDS.has(token) && !/^\d+$/.test(token)).map(normalizeToken);
}
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}
const ALIASES = {
  mana: ["magic", "resource", "attribute"],
  magic: ["mana", "resource"],
  attribute: ["stat", "stats", "resource"],
  stat: ["attribute", "stats", "level", "xp"],
  xp: ["experience", "level", "attribute"],
  config: ["configuration", "configure", "setting"],
  setup: ["create", "add", "configure", "config"],
  set: ["setup", "create", "add", "configure", "change"],
  cost: ["costs", "price", "expense", "spend"],
  integrate: ["integration", "compatibility", "api", "hook", "bridge", "interact"],
  compatible: ["compatibility", "integration", "api", "support"],
  api: ["integration", "hook", "bridge", "method"],
  mod: ["mods", "modded", "plugin", "addon"],
  template: ["build", "template"],
  respec: ["reset", "reallocate", "points"],
  permission: ["permissions", "op", "perm", "access"],
  command: ["commands", "cmd", "console"],
  damage: ["attack", "combat"],
  health: ["hp", "life"],
  level: ["levels", "xp", "exp"],
  player: ["players", "characters"]
};
const CROSS_MOD_HINTS = [
  "another mod",
  "other mod",
  "another plugin",
  "other plugin",
  "another addon",
  "with another",
  "with other",
  "together",
  "compatib",
  "integrat",
  "third-party",
  "third party",
  "work with",
  "interact with"
];
const CROSS_MOD_TERMS = ["integration", "compatibility", "api", "hook", "bridge", "interact"];
function expandQueryTokens(query) {
  const lower = query.toLowerCase();
  const tokens = tokenize(query);
  const expanded = [];
  const seen = /* @__PURE__ */ new Set();
  const push = (token) => {
    if (!seen.has(token)) {
      seen.add(token);
      expanded.push(token);
    }
  };
  for (const token of tokens) {
    push(token);
    for (const alias of ALIASES[token] ?? []) push(alias);
  }
  if (CROSS_MOD_HINTS.some((hint) => lower.includes(hint))) {
    for (const term of CROSS_MOD_TERMS) push(term);
  }
  return expanded;
}
function buildRetrievalQuery(current, previousUserMessage) {
  const trimmed = current.trim();
  const tokens = tokenize(trimmed);
  const isFollowUp = tokens.length <= 2 || /^(no|not|yes|yeah|yep|ok|okay|hmm|wait|but|and|so|then)\b/i.test(trimmed);
  if (previousUserMessage && isFollowUp) {
    return `${previousUserMessage} ${trimmed}`;
  }
  return trimmed;
}
const MAX_CHUNK_CHARS = 3200;
function chunkDoc(doc) {
  const lines = doc.content.split("\n");
  const chunks = [];
  let heading = "";
  let section = [];
  const flush = () => {
    const text = section.join("\n").trim();
    if (!text) return;
    if (text.length <= MAX_CHUNK_CHARS) {
      chunks.push(makeChunk(doc, heading, text));
      return;
    }
    const paragraphs = text.split(/\n{2,}/);
    let buffer = "";
    for (const paragraph of paragraphs) {
      if ((buffer + "\n\n" + paragraph).length > MAX_CHUNK_CHARS && buffer) {
        chunks.push(makeChunk(doc, heading, buffer));
        buffer = paragraph;
      } else {
        buffer = buffer ? `${buffer}

${paragraph}` : paragraph;
      }
    }
    if (buffer) {
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
function makeChunk(doc, heading, content) {
  return {
    docId: doc.id,
    source: doc.source,
    slug: doc.slug,
    title: doc.title,
    heading,
    content,
    tokens: estimateTokens(content)
  };
}
function indexChunk(chunk) {
  const header = tokenize(`${chunk.title} ${chunk.heading}`);
  const body = tokenize(chunk.content);
  return {
    chunk,
    body,
    header,
    uniq: [.../* @__PURE__ */ new Set([...header, ...body])]
  };
}
function buildStats(entries) {
  let totalLength = 0;
  for (const entry of entries) {
    totalLength += entry.chunk.content.length;
  }
  return {
    n: entries.length,
    avgdl: entries.length ? totalLength / entries.length : 1,
    entries,
    vocab: [...new Set(entries.flatMap((entry) => entry.uniq))]
  };
}
function matchTerms(queryToken, stats) {
  const matched = /* @__PURE__ */ new Set([queryToken]);
  for (const key of stats.vocab) {
    if (key === queryToken) continue;
    if (key.length >= 4 && queryToken.length >= 4 && (key.startsWith(queryToken) || queryToken.startsWith(key))) {
      matched.add(key);
    }
  }
  return matched;
}
function scoreChunk(queryTokens, entry, stats) {
  const norm = K1 * (1 - B + B * (entry.chunk.content.length / stats.avgdl));
  let score = 0;
  for (const queryToken of queryTokens) {
    const terms = matchTerms(queryToken, stats);
    const df = stats.entries.filter((other) => other.uniq.some((token) => terms.has(token))).length;
    if (df === 0) continue;
    const idf = Math.log(1 + (stats.n - df + 0.5) / (df + 0.5));
    const tf = entry.body.filter((token) => terms.has(token)).length;
    if (tf === 0) continue;
    const headerBoost = entry.header.some((token) => terms.has(token)) ? 2 : 1;
    score += idf * (tf * (K1 + 1) / (tf + norm)) * headerBoost;
  }
  return score;
}
const K1 = 1.5;
const B = 0.75;
function retrieveChunks(query, chunks, topK = 8) {
  const queryTokens = expandQueryTokens(query);
  if (queryTokens.length === 0 || chunks.length === 0) return [];
  const indexed = chunks.map(indexChunk);
  const stats = buildStats(indexed);
  return stats.entries.map((entry) => ({ entry, score: scoreChunk(queryTokens, entry, stats) })).filter((hit) => hit.score > 0).sort((a, b) => b.score - a.score).slice(0, topK).map((hit) => hit.entry.chunk);
}
function chunkAll(docs) {
  const chunks = [];
  for (const doc of docs) {
    chunks.push(...chunkDoc(doc));
  }
  return chunks;
}
export {
  buildRetrievalQuery,
  chunkAll,
  chunkDoc,
  estimateTokens,
  expandQueryTokens,
  normalizeToken,
  retrieveChunks,
  tokenize
};
