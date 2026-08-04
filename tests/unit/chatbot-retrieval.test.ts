import { describe, expect, it } from "vitest";
import {
  buildRetrievalQuery,
  chunkDoc,
  expandQueryTokens,
  normalizeToken,
  retrieveChunks,
  tokenize,
} from "@/lib/chatbot/retrieval";
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
  it("keeps meaningful words and drops stop words", () => {
    const tokens = tokenize("How do I change max_player_level in settings.json?");
    expect(tokens).toContain("max");
    expect(tokens).toContain("player");
    expect(tokens).toContain("level");
    expect(tokens).toContain("setting");
    expect(tokens).toContain("json");
    expect(tokens).not.toContain("how");
    expect(tokens).not.toContain("the");
  });

  it("splits compound config keys so word queries match them", () => {
    const tokens = tokenize("mana_cost in cmd_to_exc");
    expect(tokens).toContain("mana");
    expect(tokens).toContain("cost");
    expect(tokens).toContain("cmd");
    expect(tokens).toContain("exc");
  });

  it("normalizes plurals without mangling short or special words", () => {
    expect(normalizeToken("mods")).toBe("mod");
    expect(normalizeToken("values")).toBe("value");
    expect(normalizeToken("stats")).toBe("stat");
    expect(normalizeToken("ras")).toBe("ras");
    expect(normalizeToken("class")).toBe("class");
    expect(normalizeToken("status")).toBe("status");
  });
});

describe("chatbot retrieval — query expansion", () => {
  it("expands mana into the attribute/resource vocabulary", () => {
    const tokens = expandQueryTokens("how do i set up mana");
    expect(tokens).toContain("mana");
    expect(tokens).toContain("magic");
    expect(tokens).toContain("resource");
    expect(tokens).toContain("attribute");
  });

  it("adds integration vocabulary for cross-mod questions", () => {
    const tokens = expandQueryTokens("setup mana stats with another mod");
    expect(tokens).toContain("integration");
    expect(tokens).toContain("compatibility");
    expect(tokens).toContain("api");
  });

  it("does not expand plain questions about the mod", () => {
    const tokens = expandQueryTokens("what is the max level?");
    expect(tokens).not.toContain("integration");
    expect(tokens).toContain("level");
  });
});

describe("chatbot retrieval — follow-up queries", () => {
  it("inherits the previous topic for short follow-ups", () => {
    const query = buildRetrievalQuery("No For The configs", "How Can I Setup a RPG Mana Stats With another mod");
    expect(query).toContain("How Can I Setup a RPG Mana Stats With another mod");
  });

  it("keeps standalone questions as-is", () => {
    expect(buildRetrievalQuery("How do I change max level", "previous question")).toBe("How do I change max level");
  });

  it("treats yes/no answers as follow-ups", () => {
    const query = buildRetrievalQuery("yes", "does it work on fabric?");
    expect(query).toBe("does it work on fabric? yes");
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
    ]
      .map(chunkDoc)
      .flat();

    const hits = retrieveChunks("how do I change max player level", chunks, 3);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].slug).toBe("configuration/main-config");
  });

  it("prefix-matches config vs configuration", () => {
    const chunks = [
      doc({
        id: "a",
        slug: "configuration/overview",
        content: `# Configuration\n\nAll config files live in config/ras/.`,
      }),
      doc({
        id: "b",
        slug: "installation",
        content: `# Installation\n\nPut the jar in the mods folder.`,
      }),
    ]
      .map(chunkDoc)
      .flat();

    const hits = retrieveChunks("where is the config", chunks, 2);
    expect(hits[0].slug).toBe("configuration/overview");
  });

  it("returns nothing for irrelevant queries", () => {
    const chunks = [doc({ content: "# Config\n\nmax_player_level setting." })].map(chunkDoc).flat();
    expect(retrieveChunks("zzzzz qqqqq", chunks, 3)).toEqual([]);
  });
});
