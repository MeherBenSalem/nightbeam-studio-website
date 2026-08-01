import "server-only";
import { getServerEnv } from "@/lib/config/env";
import type { DataRepo } from "@/lib/db/data-repo";
import { isDatabaseReachable } from "@/lib/db/prisma";
import { memoryRepo } from "@/lib/db/repo-memory";
import { prismaRepo } from "@/lib/db/repo-prisma";

export type { DataRepo };
export type { ProjectFilters, ProjectSummary, ProjectDetail } from "@/lib/db/types";

let cachedRepo: DataRepo | null = null;

export async function getRepo(): Promise<DataRepo> {
  if (cachedRepo) return cachedRepo;
  const mode = getServerEnv().DATA_BACKEND;
  if (mode === "memory") {
    cachedRepo = memoryRepo;
    return cachedRepo;
  }
  if (mode === "prisma") {
    cachedRepo = prismaRepo;
    return cachedRepo;
  }
  cachedRepo = (await isDatabaseReachable()) ? prismaRepo : memoryRepo;
  if (cachedRepo === memoryRepo && process.env.NODE_ENV !== "test") {
    console.info("[repo] PostgreSQL not reachable — using the seeded in-memory catalog");
  }
  return cachedRepo;
}

export async function getDataBackendLabel(): Promise<"postgres" | "memory"> {
  return (await getRepo()) === prismaRepo ? "postgres" : "memory";
}
