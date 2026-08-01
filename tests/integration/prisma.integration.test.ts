import { afterAll, beforeAll, describe, expect, it } from "vitest";

const hasTestDb = Boolean(process.env.TEST_DATABASE_URL);

describe.skipIf(!hasTestDb)("Prisma integration", () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
    const { prismaRepo } = await import("@/lib/db/repo-prisma");
    await prismaRepo.upsertCurseForgeProject({
      id: "test-project-1",
      slug: "test-birth-of-steve",
      name: "The Birth of Steve (test)",
      summary: "Integration fixture",
      description: "Fixture description",
      type: "MOD",
      curseforgeId: 424242,
      authorName: "Mahou",
      studioName: "NightBeam Studio",
      curseforgeUrl: null,
      githubUrl: null,
      iconUrl: null,
      bannerUrl: null,
      featured: true,
      status: "ACTIVE",
      downloads: 10,
      followers: 2,
      views: 5,
      rating: 4.5,
      lastSyncedAt: new Date(),
      minecraftVersions: ["26.2"],
      loaders: ["NEOFORGE"],
      categories: [{ slug: "adventure", name: "Adventure" }],
      tags: [{ slug: "steve", name: "steve" }],
      latestVersion: "0.4.0",
      updatedAt: new Date(),
      versions: [
        {
          id: "test-version-1",
          version: "0.4.0",
          minecraftVersions: ["26.2"],
          loaders: ["NEOFORGE"],
          changelog: null,
          releaseDate: new Date(),
          releaseType: "RELEASE",
          isLatest: true,
          files: [
            {
              id: "test-file-1",
              fileName: "test.jar",
              fileSize: 1000,
              downloads: 1,
              downloadUrl: null,
              sha1: null,
              kind: "primary",
            },
          ],
        },
      ],
      screenshots: [],
      changelogs: [],
      docs: [],
      dependencies: [],
      comments: [],
    });
  });

  it("lists and reads back the project", async () => {
    const { prismaRepo } = await import("@/lib/db/repo-prisma");
    const result = await prismaRepo.listProjects({ search: "test-birth" });
    expect(result.total).toBeGreaterThanOrEqual(1);
    const detail = await prismaRepo.getProjectBySlug("test-birth-of-steve");
    expect(detail?.versions[0]?.files[0]?.fileName).toBe("test.jar");
  });

  it("creates and updates a user", async () => {
    const { prismaRepo } = await import("@/lib/db/repo-prisma");
    const user = await prismaRepo.createUser({ name: "Tester", email: "tester@nightbeam.studio", passwordHash: "hash" });
    const updated = await prismaRepo.updateUser(user.id, { displayName: "Tester Two" });
    expect(updated?.displayName).toBe("Tester Two");
    await prismaRepo.deleteUser(user.id);
    expect(await prismaRepo.getUserById(user.id)).toBeNull();
  });

  afterAll(async () => {
    const { prismaRepo } = await import("@/lib/db/repo-prisma");
    const { getPrisma } = await import("@/lib/db/prisma");
    const project = await prismaRepo.getProjectBySlug("test-birth-of-steve");
    if (project) {
      await getPrisma()?.project.delete({ where: { id: project.id } });
    }
  });
});
