import "server-only";
import { getServerEnv } from "@/lib/config/env";
import { createCache } from "@/lib/curseforge/cache";
import type { CfFile, CfFilesResponse, CfMod, CfModResponse, CfSearchResponse } from "@/lib/curseforge/types";

const BASE_URL = "https://api.curseforge.com";

export class CurseForgeError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "CurseForgeError";
  }
}

export function isCurseForgeConfigured(): boolean {
  const env = getServerEnv();
  return Boolean(env.CURSEFORGE_API_KEY && env.CURSEFORGE_AUTHOR_ID);
}

async function fetchJson<T>(path: string): Promise<T> {
  const env = getServerEnv();
  if (!env.CURSEFORGE_API_KEY) {
    throw new CurseForgeError("CurseForge API key is not configured", 401);
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: {
        "x-api-key": env.CURSEFORGE_API_KEY,
        Accept: "application/json",
      },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) {
      throw new CurseForgeError(`CurseForge request failed (${response.status})`, response.status);
    }
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

function ttlFor(kind: "projects" | "details" | "stats" | "files"): number {
  const env = getServerEnv();
  if (kind === "projects") return env.CACHE_TTL_PROJECTS;
  if (kind === "details") return env.CACHE_TTL_DETAILS;
  if (kind === "files") return env.CACHE_TTL_FILES;
  return env.CACHE_TTL_STATS;
}

const cache = createCache({ prefix: "cf:" });

export async function getAuthorMods(authorId: string | number): Promise<CfMod[]> {
  const env = getServerEnv();
  const cacheKey = `author:${authorId}:mods`;
  const cached = await cache.get<CfMod[]>(cacheKey);
  if (cached) return cached;

  const response = await fetchJson<CfSearchResponse>(
    `/v1/mods/search?gameId=${env.CURSEFORGE_GAME_ID}&authorId=${authorId}&pageSize=50&sortField=1&sortOrder=desc`,
  );
  await cache.set(cacheKey, response.data, ttlFor("projects"));
  return response.data;
}

export async function getModDetails(modId: number): Promise<CfMod> {
  const cacheKey = `mod:${modId}:details`;
  const cached = await cache.get<CfMod>(cacheKey);
  if (cached) return cached;
  const response = await fetchJson<CfModResponse>(`/v1/mods/${modId}`);
  await cache.set(cacheKey, response.data, ttlFor("details"));
  return response.data;
}

export async function getModStats(modId: number): Promise<CfMod> {
  const cacheKey = `mod:${modId}:stats`;
  const cached = await cache.get<CfMod>(cacheKey);
  if (cached) return cached;
  const response = await fetchJson<CfModResponse>(`/v1/mods/${modId}`);
  await cache.set(cacheKey, response.data, ttlFor("stats"));
  return response.data;
}

export async function getModFiles(modId: number): Promise<CfFile[]> {
  const cacheKey = `mod:${modId}:files`;
  const cached = await cache.get<CfFile[]>(cacheKey);
  if (cached) return cached;
  const response = await fetchJson<CfFilesResponse>(`/v1/mods/${modId}/files?pageSize=50`);
  await cache.set(cacheKey, response.data, ttlFor("files"));
  return response.data;
}
