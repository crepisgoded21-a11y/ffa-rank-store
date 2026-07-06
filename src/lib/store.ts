import { redis } from "./redis";

const PENDING_KEY = "rankshop:pending-purchases";

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
