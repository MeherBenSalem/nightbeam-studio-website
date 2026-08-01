import "server-only";
import Redis from "ioredis";

export interface CacheStats {
  kind: "redis" | "memory";
  keys: number;
  hits: number;
  misses: number;
}

export interface CacheAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  flush(): Promise<void>;
  stats(): Promise<CacheStats>;
}

class MemoryCache implements CacheAdapter {
  private store = new Map<string, { value: unknown; expiresAt: number }>();
  private hits = 0;
  private misses = 0;

  constructor(private prefix: string) {}

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(this.prefix + key);
    if (!entry) {
      this.misses += 1;
      return null;
    }
    if (entry.expiresAt < Date.now()) {
      this.store.delete(this.prefix + key);
      this.misses += 1;
      return null;
    }
    this.hits += 1;
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds = 600): Promise<void> {
    this.store.set(this.prefix + key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  async del(key: string): Promise<void> {
    this.store.delete(this.prefix + key);
  }

  async flush(): Promise<void> {
    for (const key of this.store.keys()) {
      if (key.startsWith(this.prefix)) this.store.delete(key);
    }
  }

  async stats(): Promise<CacheStats> {
    let keys = 0;
    for (const key of this.store.keys()) {
      if (key.startsWith(this.prefix)) keys += 1;
    }
    return { kind: "memory", keys, hits: this.hits, misses: this.misses };
  }
}

class RedisCache implements CacheAdapter {
  private client: Redis | null = null;
  private fallback: MemoryCache;
  private hits = 0;
  private misses = 0;

  constructor(private prefix: string) {
    this.fallback = new MemoryCache(prefix);
    const url = process.env.REDIS_URL;
    if (!url) return;
    try {
      const client = new Redis(url, {
        lazyConnect: true,
        connectTimeout: 2000,
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => (times > 2 ? null : Math.min(500 * times, 2000)),
        enableOfflineQueue: false,
      });
      client.on("error", (error) => {
        console.warn(`[cache] Redis error, falling back to memory: ${error.message}`);
        void client.disconnect();
        this.client = null;
      });
      client.connect().catch(() => {
        this.client = null;
      });
      this.client = client;
    } catch {
      this.client = null;
    }
  }

  private get redis(): Redis | null {
    return this.client?.status === "ready" ? this.client : null;
  }

  async get<T>(key: string): Promise<T | null> {
    const r = this.redis;
    if (!r) return this.fallback.get<T>(key);
    try {
      const raw = await r.get(this.prefix + key);
      if (raw === null) {
        this.misses += 1;
        return null;
      }
      this.hits += 1;
      return JSON.parse(raw) as T;
    } catch {
      return this.fallback.get<T>(key);
    }
  }

  async set<T>(key: string, value: T, ttlSeconds = 600): Promise<void> {
    const r = this.redis;
    if (!r) return this.fallback.set(key, value, ttlSeconds);
    try {
      await r.set(this.prefix + key, JSON.stringify(value), "EX", ttlSeconds);
    } catch {
      await this.fallback.set(key, value, ttlSeconds);
    }
  }

  async del(key: string): Promise<void> {
    const r = this.redis;
    if (!r) return this.fallback.del(key);
    try {
      await r.del(this.prefix + key);
    } catch {
      await this.fallback.del(key);
    }
  }

  async flush(): Promise<void> {
    const r = this.redis;
    if (!r) return this.fallback.flush();
    try {
      const keys = await r.keys(this.prefix + "*");
      if (keys.length > 0) await r.del(...keys);
    } catch {
      await this.fallback.flush();
    }
  }

  async stats(): Promise<CacheStats> {
    const r = this.redis;
    if (!r) return this.fallback.stats();
    try {
      const keys = await r.keys(this.prefix + "*");
      return { kind: "redis", keys: keys.length, hits: this.hits, misses: this.misses };
    } catch {
      return this.fallback.stats();
    }
  }
}

const instances = new Map<string, CacheAdapter>();

export function createCache(options: { prefix?: string; ttl?: number } = {}): CacheAdapter {
  const key = options.prefix ?? "cache:";
  let instance = instances.get(key);
  if (!instance) {
    instance = new RedisCache(key);
    instances.set(key, instance);
  }
  return instance;
}

export async function getCacheStats(): Promise<CacheStats> {
  return createCache().stats();
}

export async function flushAllCaches(): Promise<void> {
  await Promise.all([...instances.values()].map((instance) => instance.flush()));
}
