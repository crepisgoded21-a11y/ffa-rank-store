import { Redis } from "@upstash/redis";

const PENDING_KEY = "rankshop:pending-purchases";

let client: Redis | null = null;

function redis(): Redis {
  if (client) return client;

  // Vercel's Redis marketplace integrations inject either the native Upstash
  // env var names or the legacy Vercel KV names depending on how the
  // integration was added — support both.
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    throw new Error(
      "No Redis connection found. Connect an Upstash Redis (or Vercel KV) integration to this project."
    );
  }

  client = new Redis({ url, token });
  return client;
}

export type PendingPurchase = {
  id: string;
  ign: string;
  rank: string;
  nickname?: string;
  color?: string;
};

export async function addPendingPurchase(purchase: PendingPurchase): Promise<void> {
  await redis().hset(PENDING_KEY, { [purchase.id]: JSON.stringify(purchase) });
}

export async function hasPendingPurchase(id: string): Promise<boolean> {
  return (await redis().hexists(PENDING_KEY, id)) === 1;
}

export async function listPendingPurchases(): Promise<PendingPurchase[]> {
  const all = await redis().hgetall<Record<string, string>>(PENDING_KEY);
  if (!all) return [];
  return Object.values(all).map((value) =>
    typeof value === "string" ? JSON.parse(value) : (value as unknown as PendingPurchase)
  );
}

export async function ackPendingPurchase(id: string): Promise<void> {
  await redis().hdel(PENDING_KEY, id);
}
