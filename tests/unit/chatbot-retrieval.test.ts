import { describe, expect, it } from "vitest";
import { chunkDoc, retrieveChunks, tokenize } from "@/lib/chatbot/retrieval";
import type { KnowledgeDoc } from "@/lib/chatbot/types";

function doc(overrides: Partial<KnowledgeDoc> = {}): KnowledgeDoc {
  return {
    id: "d1",
    source: "rpg-attribute-system",
    slug: "configuration/main-config",
    title: "Main Config",
    content: "",
    filePath: "docs/configuration/main-config.md",
    ...overrides,
  };
}

describe("chatbot retrieval — tokenizer", () => {
  it("keeps meaningful tokens and drops stop words", () => {
    const tokens = tokenize("How do I change max_player_level in settings.json?");
    expect(tokens).toContain("max_player_level");
    expect(tokens).toContain("settings.json");
    expect(tokens).not.toContain("how");
    expect(tokens).not.toContain("the");
  });
});

describe("chatbot retrieval — chunking", () => {
  it("splits docs on headings", () => {
    const chunks = chunkDoc(
      doc({
        content: `# Main Config\n\nIntro paragraph.\n\n## Max Level\n\nSet max_player_level here.\n\n## XP Curve\n\nSet exp_curve_max_level here.`,
      }),
    );
    expect(chunks.length).toBe(3);
    expect(chunks[0].heading).toBe("Main Config");
    expect(chunks[1].heading).toBe("Max Level");
    expect(chunks[1].content).toContain("max_player_level");
    expect(chunks[2].heading).toBe("XP Curve");
  });

  it("sub-splits oversized sections", () => {
    const big = "paragraph one\n\n".repeat(10) + "word ".repeat(4000);
    const chunks = chunkDoc(doc({ content: `# Big\n\n${big}` }));
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.content.length).toBeLessThanOrEqual(3300);
    }
  });
});

describe("chatbot retrieval — BM25 scoring", () => {
  it("ranks the relevant chunk first", () => {
    const chunks = [
      doc({
        id: "a",
        slug: "configuration/main-config",
        content: `# Max Level\n\nSet max_player_level in settings.json to change the maximum level.`,
      }),
      doc({
        id: "b",
        slug: "api/overview",
        content: `# API\n\nThe mod exposes a public read API for other mods.`,
      }),
      doc({
        id: "c",
        slug: "installation",
        content: `# Installation\n\nPut the jar in the mods folder.`,
      }),
    ].map(chunkDoc).flat();

    const hits = retrieveChunks("how do I change max player level", chunks, 3);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].slug).toBe("configuration/main-config");
  });

  it("returns nothing for irrelevant queries", () => {
    const chunks = [doc({ content: "# Config\n\nmax_player_level setting." })].map(chunkDoc).flat();
    expect(retrieveChunks("zzzzz qqqqq", chunks, 3)).toEqual([]);
  });
});
