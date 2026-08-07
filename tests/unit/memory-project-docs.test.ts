import { beforeEach, describe, expect, it } from "vitest";
import { memoryStore, resetMemoryStore } from "@/lib/db/memory-store";

describe("memoryStore project docs", () => {
  beforeEach(async () => {
    resetMemoryStore();
    await memoryStore.ensureSeeded();
  });

  it("preserves authored docs when CurseForge sync sends an empty docs array", async () => {
    const before = memoryStore.getProjectDetail("jauml");
    expect(before?.docs.length).toBeGreaterThan(0);
    const docCount = before!.docs.length;

    memoryStore.upsertCurseForgeProject({
      ...before!,
      id: "cf-jauml",
      docs: [],
      downloads: before!.downloads + 1,
    });

    const after = memoryStore.getProjectDetail("jauml");
    expect(after?.docs).toHaveLength(docCount);
    expect(after?.downloads).toBe(before!.downloads + 1);
  });

  it("replaceProjectDocs swaps pages by slug", () => {
    const ok = memoryStore.replaceProjectDocs("jauml", [
      { slug: "overview", title: "Overview", content: "## Hello", sortOrder: 0 },
    ]);
    expect(ok).toBe(true);
    const after = memoryStore.getProjectDetail("jauml");
    expect(after?.docs).toHaveLength(1);
    expect(after?.docs[0]?.slug).toBe("overview");
    expect(after?.docs[0]?.content).toContain("Hello");
  });
});
