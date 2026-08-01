import { describe, expect, it } from "vitest";
import { FIXTURE_MOD } from "@/lib/curseforge/fixtures";
import { mapCfModToDetail, mapCfModToSummary, mapCfLoader } from "@/lib/curseforge/mapper";

describe("CurseForge mapper", () => {
  it("maps a mod to a summary with loader and version facts", () => {
    const summary = mapCfModToSummary(FIXTURE_MOD);
    expect(summary.slug).toBe("the-birth-of-steve");
    expect(summary.name).toBe("The Birth of Steve");
    expect(summary.authorName).toBe("Mahou");
    expect(summary.curseforgeId).toBe(987654);
    expect(summary.downloads).toBe(12_840);
    expect(summary.featured).toBe(true);
    expect(summary.loaders).toContain("NEOFORGE");
    expect(summary.loaders).toContain("FABRIC");
    expect(summary.minecraftVersions).toContain("26.1.2");
    expect(summary.latestVersion).toBe("0.4.0");
    expect(summary.categories.map((category) => category.slug)).toEqual(["adventure", "story"]);
  });

  it("maps files to versions sorted newest first with the latest flag", () => {
    const detail = mapCfModToDetail(FIXTURE_MOD, FIXTURE_MOD.latestFiles);
    expect(detail.versions.length).toBe(2);
    expect(detail.versions[0].isLatest).toBe(true);
    expect(detail.versions[0].files[0].fileName).toContain("neoforge");
    expect(detail.versions[0].files[0].downloadUrl).toContain("edge.forgecdn.net");
    expect(detail.screenshots.length).toBe(1);
  });

  it("maps CurseForge loader names", () => {
    expect(mapCfLoader("NeoForge")).toBe("NEOFORGE");
    expect(mapCfLoader("fabric")).toBe("FABRIC");
    expect(mapCfLoader("Forge")).toBe("FORGE");
    expect(mapCfLoader("Quilt")).toBe("QUILT");
    expect(mapCfLoader("unknown")).toBeUndefined();
  });
});
