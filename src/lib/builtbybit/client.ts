import "server-only";
import { createCache } from "@/lib/curseforge/cache";
import { getServerEnv } from "@/lib/config/env";
import type {
  BbbLicense,
  BbbListEnvelope,
  BbbListStats,
  BbbMemberSelf,
  BbbResource,
  BbbStore,
  BbbVersion,
} from "@/lib/builtbybit/types";

const BASE_URL = "https://api.builtbybit.com";

export class BuiltByBitError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "BuiltByBitError";
  }
}

function ttlFor(kind: "resources" | "versions" | "licenses" | "stores" | "health"): number {
  const env = getServerEnv();
  if (kind === "resources") return env.CACHE_TTL_PROJECTS;
  if (kind === "versions") return env.CACHE_TTL_FILES;
  if (kind === "licenses") return env.CACHE_TTL_STATS;
  return env.CACHE_TTL_STATS;
}

const cache = createCache({ prefix: "bbb:" });

async function fetchJson<T>(path: string, options: { bearer?: string } = {}): Promise<T> {
  const env = getServerEnv();
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (options.bearer) {
    headers.Authorization = `Bearer ${options.bearer}`;
  } else if (env.BUILTBYBIT_API_TOKEN) {
    headers.Authorization = `Token ${env.BUILTBYBIT_API_TOKEN}`;
  } else {
    throw new BuiltByBitError("BuiltByBit API token is not configured", 401);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers,
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) {
      let detail = "";
      try {
        detail = await response.text();
      } catch {
        // ignore
      }
      throw new BuiltByBitError(
        `BuiltByBit request failed (${response.status})${detail ? `: ${detail.slice(0, 200)}` : ""}`,
        response.status,
      );
    }
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

function extractList<T>(
  envelope: BbbListEnvelope<T>,
  key: "resources" | "versions" | "licenses" | "stores",
): { items: T[]; stats: BbbListStats | null } {
  const bucket = envelope.data?.[key];
  const items = Array.isArray(bucket) ? bucket : [];
  const stats = envelope.data?.stats ?? null;
  return { items, stats };
}

async function paginateCreatorList<T>(
  pathBase: string,
  key: "resources" | "versions" | "licenses" | "stores",
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  const perPage = 100;
  while (true) {
    const separator = pathBase.includes("?") ? "&" : "?";
    const envelope = await fetchJson<BbbListEnvelope<T>>(
      `${pathBase}${separator}page=${page}&per_page=${perPage}`,
    );
    const { items, stats } = extractList(envelope, key);
    all.push(...items);
    const maxPage = stats?.max_page ?? (items.length < perPage ? page : page + 1);
    if (page >= maxPage || items.length === 0) break;
    page += 1;
  }
  return all;
}

export async function getHealth(): Promise<{ data?: string; result?: string }> {
  const cacheKey = "health";
  const cached = await cache.get<{ data?: string; result?: string }>(cacheKey);
  if (cached) return cached;
  const response = await fetchJson<{ data?: string; result?: string }>("/v2/health");
  await cache.set(cacheKey, response, ttlFor("health"));
  return response;
}

export async function getCreatorResources(): Promise<BbbResource[]> {
  const cacheKey = "creator:resources";
  const cached = await cache.get<BbbResource[]>(cacheKey);
  if (cached) return cached;

  // Do not pass `with=` hints — invalid values return InvalidWithHint and break sync.
  const all = await paginateCreatorList<BbbResource>("/v2/resources/creator/resources", "resources");
  await cache.set(cacheKey, all, ttlFor("resources"));
  return all;
}

export async function getCreatorVersions(resourceIds: number[]): Promise<BbbVersion[]> {
  if (resourceIds.length === 0) return [];
  const cacheKey = `creator:versions:${[...resourceIds].sort((a, b) => a - b).join(",")}`;
  const cached = await cache.get<BbbVersion[]>(cacheKey);
  if (cached) return cached;

  // BBB accepts comma-separated resource_ids; chunk to keep query strings reasonable.
  const all: BbbVersion[] = [];
  const chunkSize = 25;
  for (let i = 0; i < resourceIds.length; i += chunkSize) {
    const chunk = resourceIds.slice(i, i + chunkSize);
    const idsParam = chunk.join(",");
    const batch = await paginateCreatorList<BbbVersion>(
      `/v2/resources/creator/versions?resource_ids=${idsParam}`,
      "versions",
    );
    all.push(...batch);
  }

  await cache.set(cacheKey, all, ttlFor("versions"));
  return all;
}

export async function getCreatorLicenses(input: {
  buyerIds?: number[];
  resourceIds?: number[];
}): Promise<BbbLicense[]> {
  const buyerIds = input.buyerIds ?? [];
  const resourceIds = input.resourceIds ?? [];
  if (buyerIds.length === 0 && resourceIds.length === 0) return [];

  const cacheKey = `creator:licenses:${buyerIds.join(",")}:${resourceIds.join(",")}`;
  const cached = await cache.get<BbbLicense[]>(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams();
  if (buyerIds.length > 0) params.set("buyer_ids", buyerIds.join(","));
  if (resourceIds.length > 0) params.set("resource_ids", resourceIds.join(","));

  const all = await paginateCreatorList<BbbLicense>(
    `/v2/resources/creator/licenses?${params.toString()}`,
    "licenses",
  );
  await cache.set(cacheKey, all, ttlFor("licenses"));
  return all;
}

export async function getCreatorStores(): Promise<BbbStore[]> {
  const cacheKey = "creator:stores";
  const cached = await cache.get<BbbStore[]>(cacheKey);
  if (cached) return cached;
  const all = await paginateCreatorList<BbbStore>("/v2/resources/creator/stores", "stores");
  await cache.set(cacheKey, all, ttlFor("stores"));
  return all;
}

export async function getMemberSelf(accessToken: string): Promise<BbbMemberSelf | null> {
  try {
    const envelope = await fetchJson<{ data?: BbbMemberSelf } | BbbMemberSelf>("/v2/members/self", {
      bearer: accessToken,
    });
    if (envelope && typeof envelope === "object" && "data" in envelope && envelope.data) {
      return envelope.data;
    }
    return envelope as BbbMemberSelf;
  } catch (error) {
    if (error instanceof BuiltByBitError && (error.status === 403 || error.status === 401)) return null;
    throw error;
  }
}
