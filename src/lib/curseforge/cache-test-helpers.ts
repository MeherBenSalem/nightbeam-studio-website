// Test-only memory cache implementing the CacheAdapter contract.
export class MemoryCacheAdapter {
  private store = new Map<string, { value: unknown; expiresAt: number }>();
  private hits = 0;
  private misses = 0;

  constructor(private prefix: string) {}

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(this.prefix + key);
    if (!entry || entry.expiresAt < Date.now()) {
      if (!entry) this.misses += 1;
      return null;
    }
    this.hits += 1;
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds = 600): Promise<void> {
    const expiresAt = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : Date.now() - 1;
    this.store.set(this.prefix + key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.store.delete(this.prefix + key);
  }

  async flush(): Promise<void> {
    for (const key of this.store.keys()) {
      if (key.startsWith(this.prefix)) this.store.delete(key);
    }
  }

  async stats() {
    return { kind: "memory" as const, keys: this.store.size, hits: this.hits, misses: this.misses };
  }
}
