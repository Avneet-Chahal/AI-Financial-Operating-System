/**
 * Redis-backed cache + conversation memory for the LangChain orchestrator.
 *
 * Uses ioredis against REDIS_URL (local Docker in dev, managed Redis in prod).
 * If REDIS_URL is unset or the server is unreachable, everything transparently
 * falls back to an in-process store so the app still runs — the cache just
 * doesn't survive restarts. The public API (getJSON / setJSON / pushHistory /
 * getHistory) is storage-agnostic, so callers never branch on which is active.
 */
import Redis from 'ioredis';

type Json = unknown;

interface CacheBackend {
  getJSON<T = Json>(key: string): Promise<T | null>;
  setJSON(key: string, value: Json, ttlSeconds?: number): Promise<void>;
  pushHistory(key: string, value: Json, cap: number): Promise<void>;
  getHistory<T = Json>(key: string, limit: number): Promise<T[]>;
}

// ─── In-memory fallback ───────────────────────────────────────────────────────

class MemoryBackend implements CacheBackend {
  private kv = new Map<string, { value: string; expiresAt: number | null }>();
  private lists = new Map<string, string[]>();

  async getJSON<T>(key: string): Promise<T | null> {
    const entry = this.kv.get(key);
    if (!entry) return null;
    if (entry.expiresAt !== null && entry.expiresAt < nowMs()) {
      this.kv.delete(key);
      return null;
    }
    return JSON.parse(entry.value) as T;
  }

  async setJSON(key: string, value: Json, ttlSeconds?: number): Promise<void> {
    this.kv.set(key, {
      value: JSON.stringify(value),
      expiresAt: ttlSeconds ? nowMs() + ttlSeconds * 1000 : null,
    });
  }

  async pushHistory(key: string, value: Json, cap: number): Promise<void> {
    const list = this.lists.get(key) ?? [];
    list.unshift(JSON.stringify(value));
    this.lists.set(key, list.slice(0, cap));
  }

  async getHistory<T>(key: string, limit: number): Promise<T[]> {
    const list = this.lists.get(key) ?? [];
    return list.slice(0, limit).map((s) => JSON.parse(s) as T);
  }
}

// nowMs is factored out because Date.now() is fine here (this is runtime app code,
// not a workflow script) but keeping it in one place documents the intent.
function nowMs(): number {
  return Date.now();
}

// ─── Redis backend ────────────────────────────────────────────────────────────

class RedisBackend implements CacheBackend {
  constructor(private client: Redis) {}

  // The cache is best-effort: it accelerates responses but is never the source of
  // truth. A Redis outage (connection closed, timeout, etc.) must therefore never
  // propagate out of these methods and crash request handling — reads degrade to a
  // miss (null / []) and writes degrade to a no-op. This is the contract callers
  // rely on (see file header); enforce it here rather than at every call site.
  private safe<T>(op: string, fallback: T, fn: () => Promise<T>): Promise<T> {
    return fn().catch((err) => {
      console.error(`[redis] ${op} failed, degrading to fallback:`, (err as Error).message);
      return fallback;
    });
  }

  async getJSON<T>(key: string): Promise<T | null> {
    return this.safe(`get ${key}`, null, async () => {
      const raw = await this.client.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    });
  }

  async setJSON(key: string, value: Json, ttlSeconds?: number): Promise<void> {
    return this.safe(`set ${key}`, undefined, async () => {
      const raw = JSON.stringify(value);
      if (ttlSeconds) await this.client.set(key, raw, 'EX', ttlSeconds);
      else await this.client.set(key, raw);
    });
  }

  async pushHistory(key: string, value: Json, cap: number): Promise<void> {
    return this.safe(`pushHistory ${key}`, undefined, async () => {
      await this.client
        .multi()
        .lpush(key, JSON.stringify(value))
        .ltrim(key, 0, cap - 1)
        .exec();
    });
  }

  async getHistory<T>(key: string, limit: number): Promise<T[]> {
    return this.safe(`getHistory ${key}`, [], async () => {
      const items = await this.client.lrange(key, 0, limit - 1);
      return items.map((s) => JSON.parse(s) as T);
    });
  }
}

// ─── Backend selection (singleton) ────────────────────────────────────────────

const globalForCache = globalThis as unknown as { __aifosCache?: CacheBackend };

function createBackend(): CacheBackend {
  const url = process.env.REDIS_URL;
  if (!url) {
    console.warn('[redis] REDIS_URL not set — using in-memory cache (dev only).');
    return new MemoryBackend();
  }
  try {
    const client = new Redis(url, {
      lazyConnect: false,
      maxRetriesPerRequest: 2,
      // Don't crash the process if Redis is briefly unavailable.
      retryStrategy: (times) => (times > 5 ? null : Math.min(times * 200, 1000)),
    });
    client.on('error', (err) => {
      // Logged, not thrown — a Redis blip must not take down request handling.
      console.error('[redis] connection error:', err.message);
    });
    return new RedisBackend(client);
  } catch (err) {
    console.error('[redis] failed to initialize, falling back to memory:', err);
    return new MemoryBackend();
  }
}

export const cache: CacheBackend = globalForCache.__aifosCache ?? createBackend();
if (process.env.NODE_ENV !== 'production') globalForCache.__aifosCache = cache;
