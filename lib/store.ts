// A tiny key/value store abstraction.
//
// - In production (or anywhere UPSTASH creds are set) it uses Upstash Redis
//   over its REST API, so state is shared across all serverless instances.
// - Otherwise it falls back to a process-global in-memory Map, which is fine
//   for local `next dev` (single process) but NOT shared across Vercel
//   serverless instances.
//
// No npm dependencies required — just fetch + two env vars.

const REST_URL =
  process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "";
const REST_TOKEN =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "";

export const usingRedis = Boolean(REST_URL && REST_TOKEN);

// ---- in-memory fallback (per-process) ----
interface MemEntry {
  value: string;
  expiresAt: number | null;
}
const g = globalThis as unknown as { __rpsKV?: Map<string, MemEntry> };
const mem: Map<string, MemEntry> = g.__rpsKV ?? new Map();
g.__rpsKV = mem;

function memGet(key: string): string | null {
  const e = mem.get(key);
  if (!e) return null;
  if (e.expiresAt !== null && Date.now() > e.expiresAt) {
    mem.delete(key);
    return null;
  }
  return e.value;
}

function memSet(key: string, value: string, ttlSeconds?: number) {
  mem.set(key, {
    value,
    expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
  });
}

// ---- Upstash REST helpers ----
async function redisCmd(command: (string | number)[]): Promise<unknown> {
  const res = await fetch(REST_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Redis error ${res.status}`);
  }
  const data = (await res.json()) as { result?: unknown; error?: string };
  if (data.error) throw new Error(data.error);
  return data.result ?? null;
}

// ---- public API ----
export async function kvGet(key: string): Promise<string | null> {
  if (usingRedis) {
    const r = await redisCmd(["GET", key]);
    return (r as string | null) ?? null;
  }
  return memGet(key);
}

export async function kvSet(
  key: string,
  value: string,
  ttlSeconds?: number
): Promise<void> {
  if (usingRedis) {
    if (ttlSeconds) {
      await redisCmd(["SET", key, value, "EX", ttlSeconds]);
    } else {
      await redisCmd(["SET", key, value]);
    }
    return;
  }
  memSet(key, value, ttlSeconds);
}
