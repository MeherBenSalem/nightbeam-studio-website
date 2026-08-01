import "server-only";
import { getServerEnv } from "@/lib/config/env";
import { getAuthorMods, getModFiles } from "@/lib/curseforge/client";
import { isCurseForgeConfigured } from "@/lib/curseforge/client";
import { mapCfModToDetail } from "@/lib/curseforge/mapper";
import { getRepo } from "@/lib/db/repo";
import type { SyncStateDto } from "@/lib/db/types";

export async function runCurseForgeSync(): Promise<SyncStateDto> {
  const repo = await getRepo();
  const env = getServerEnv();

  if (!isCurseForgeConfigured()) {
    return repo.setSyncState("curseforge", {
      status: "IDLE",
      message: "CurseForge API key or author ID not configured — using the seeded catalog.",
      projectsSynced: 0,
    });
  }

  const startedAt = Date.now();
  await repo.setSyncState("curseforge", {
    status: "RUNNING",
    message: "Syncing projects from CurseForge…",
    lastRunAt: new Date(),
  });

  try {
    const authorId = Number(env.CURSEFORGE_AUTHOR_ID);
    const mods = await getAuthorMods(authorId);
    let synced = 0;
    for (const mod of mods) {
      const files = await getModFiles(mod.id);
      const detail = mapCfModToDetail(mod, files);
      await repo.upsertCurseForgeProject(detail);
      synced += 1;
    }
    await repo.setSyncState("curseforge", {
      status: "SUCCESS",
      message: `Synced ${synced} project${synced === 1 ? "" : "s"} from CurseForge.`,
      projectsSynced: synced,
      durationMs: Date.now() - startedAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown CurseForge sync error";
    await repo.setSyncState("curseforge", {
      status: "ERROR",
      message: `Sync failed: ${message}`,
      durationMs: Date.now() - startedAt,
    });
    await repo.logApiError({
      route: "curseforge:sync",
      method: "SYNC",
      status: 502,
      message,
      stack: error instanceof Error ? (error.stack ?? null) : null,
    });
    console.error("[curseforge] sync failed:", message);
  }

  return repo.getSyncState("curseforge");
}
