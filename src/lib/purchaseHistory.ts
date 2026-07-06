import { redis } from "./redis";

const HISTORY_KEY = "rankshop:purchase-history";

export type PurchaseStatus = "active" | "expired" | "refunded";

export type PurchaseRecord = {
  id: string;
  ign: string;
  rank: string;
  nickname?: string;
  color?: string;
  amount: string;
  status: PurchaseStatus;
  createdAt: number;
};

export async function purchaseRecordExists(id: string): Promise<boolean> {
  return (await redis().hexists(HISTORY_KEY, id)) === 1;
}

export async function recordPurchase(
  purchase: Omit<PurchaseRecord, "status" | "createdAt">
): Promise<void> {
  const record: PurchaseRecord = {
    ...purchase,
    status: "active",
    createdAt: Date.now(),
  };
  await redis().hset(HISTORY_KEY, { [record.id]: JSON.stringify(record) });
}

export async function getAllPurchases(): Promise<PurchaseRecord[]> {
  const all = await redis().hgetall<Record<string, string>>(HISTORY_KEY);
  if (!all) return [];
  return Object.values(all).map((value) =>
    typeof value === "string" ? JSON.parse(value) : (value as unknown as PurchaseRecord)
  );
}

export async function updatePurchaseStatus(
  id: string,
  status: PurchaseStatus
): Promise<PurchaseRecord | null> {
  const existing = await redis().hget<string>(HISTORY_KEY, id);
  if (!existing) return null;
  const record: PurchaseRecord = typeof existing === "string" ? JSON.parse(existing) : existing;
  record.status = status;
  await redis().hset(HISTORY_KEY, { [id]: JSON.stringify(record) });
  return record;
}

export type ListPurchasesQuery = {
  search?: string;
  rank?: string;
  status?: PurchaseStatus;
  dateFrom?: number;
  dateTo?: number;
  sortBy?: "createdAt" | "ign" | "rank" | "status" | "id";
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export type ListPurchasesResult = {
  items: PurchaseRecord[];
  total: number;
  page: number;
  pageSize: number;
};

export async function listPurchases(query: ListPurchasesQuery): Promise<ListPurchasesResult> {
  let items = await getAllPurchases();

  if (query.search) {
    const term = query.search.toLowerCase();
    items = items.filter(
      (p) => p.ign.toLowerCase().includes(term) || p.id.toLowerCase().includes(term)
    );
  }
  if (query.rank) {
    items = items.filter((p) => p.rank === query.rank);
  }
  if (query.status) {
    items = items.filter((p) => p.status === query.status);
  }
  if (query.dateFrom !== undefined) {
    items = items.filter((p) => p.createdAt >= query.dateFrom!);
  }
  if (query.dateTo !== undefined) {
    items = items.filter((p) => p.createdAt <= query.dateTo!);
  }

  const sortBy = query.sortBy ?? "createdAt";
  const sortDir = query.sortDir ?? "desc";
  items.sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDir === "asc" ? cmp : -cmp;
  });

  const total = items.length;
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20));
  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  return { items: pageItems, total, page, pageSize };
}
