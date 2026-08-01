import { describe, expect, it } from "vitest";
import { createCache } from "@/lib/curseforge/cache";
import { MemoryCacheAdapter } from "@/lib/curseforge/cache-test-helpers";

describe("cache", () => {
  it("stores and retrieves values within TTL", async () => {
    const cache = createCache({ prefix: "test-cache:" });
    await cache.set("key", { hello: "world" }, 60);
    expect(await cache.get("key")).toEqual({ hello: "world" });
    await cache.del("key");
    expect(await cache.get("key")).toBeNull();
  });

  it("expires entries after TTL", async () => {
    const cache = new MemoryCacheAdapter("expire:");
    await cache.set("temp", 1, 0);
    expect(await cache.get("temp")).toBeNull();
  });

  it("tracks hits and misses", async () => {
    const cache = new MemoryCacheAdapter("stats:");
    await cache.set("a", 1, 60);
    await cache.get("a");
    await cache.get("missing");
    const stats = await cache.stats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
    expect(stats.keys).toBe(1);
  });

  it("flushes only its own prefix", async () => {
    const cache = new MemoryCacheAdapter("flush:");
    await cache.set("one", 1, 60);
    await cache.set("two", 2, 60);
    await cache.flush();
    expect(await cache.get("one")).toBeNull();
    expect(await cache.get("two")).toBeNull();
  });
});
