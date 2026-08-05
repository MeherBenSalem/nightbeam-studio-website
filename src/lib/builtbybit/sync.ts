import "server-only";
import { getCreatorResources, getCreatorVersions } from "@/lib/builtbybit/client";
import { mapBbbResourceToDetail } from "@/lib/builtbybit/mapper";
import { isBuiltByBitConfigured } from "@/lib/config/env";
import { getRepo } from "@/lib/db/repo";
import type { SyncStateDto } from "@/lib/db/types";

export async function runBuiltByBitSync(): Promise<SyncStateDto> {
  const repo = await getRepo();

  if (!isBuiltByBitConfigured()) {
    return repo.setSyncState("builtbybit", {
      status: "IDLE",
      message: "BuiltByBit API token not configured — store sync skipped (memory mode uses fixtures).",
      projectsSynced: 0,
    });
  }

  const startedAt = Date.now();
  await repo.setSyncState("builtbybit", {
    status: "RUNNING",
    message: "Syncing products from BuiltByBit…",
    lastRunAt: new Date(),
  });

  try {
    const resources = await getCreatorResources();
    const resourceIds = resources.map((r) => r.resource_id);
    const versions = await getCreatorVersions(resourceIds);
    let synced = 0;
    for (const resource of resources) {
      const detail = mapBbbResourceToDetail(
        resource,
        versions.filter((v) => v.resource_id === resource.resource_id),
      );
      await repo.upsertStoreProduct(detail);
      synced += 1;
    }
    await repo.setSyncState("builtbybit", {
      status: "SUCCESS",
      message: `Synced ${synced} product${synced === 1 ? "" : "s"} from BuiltByBit.`,
      projectsSynced: synced,
      durationMs: Date.now() - startedAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown BuiltByBit sync error";
    await repo.setSyncState("builtbybit", {
      status: "ERROR",
      message: `Sync failed: ${message}`,
      durationMs: Date.now() - startedAt,
    });
    await repo.logApiError({
      route: "builtbybit:sync",
      method: "SYNC",
      status: 502,
      message,
      stack: error instanceof Error ? (error.stack ?? null) : null,
    });
    console.error("[builtbybit] sync failed:", message);
  }

  return repo.getSyncState("builtbybit");
}
