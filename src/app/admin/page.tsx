"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { PurchaseRecord, PurchaseStatus } from "../../lib/purchaseHistory";

type SortField = "createdAt" | "ign" | "rank" | "status" | "id";

const STATUS_STYLES: Record<PurchaseStatus, string> = {
  active: "bg-emerald-400/10 text-emerald-300",
  expired: "bg-amber-400/10 text-amber-300",
  refunded: "bg-red-400/10 text-red-300",
};

export default function AdminDashboardPage() {
  const router = useRouter();

  const [items, setItems] = useState<PurchaseRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [rank, setRank] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (rank) params.set("rank", rank);
    if (status) params.set("status", status);
    if (dateFrom) params.set("dateFrom", String(new Date(dateFrom).getTime()));
    if (dateTo) params.set("dateTo", String(new Date(dateTo).getTime() + 86400000 - 1));
    params.set("sortBy", sortBy);
    params.set("sortDir", sortDir);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));

    try {
      const res = await fetch(`/api/admin/purchases?${params.toString()}`);
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to load purchases.");
      const data = await res.json();
      setItems(data.items);
      setTotal(data.total);
    } catch {
      setError("Failed to load purchases.");
    } finally {
      setLoading(false);
    }
  }, [search, rank, status, dateFrom, dateTo, sortBy, sortDir, page, router]);

  useEffect(() => {
    const timeout = setTimeout(load, 250);
    return () => clearTimeout(timeout);
  }, [load]);

  async function handleStatusChange(id: string, newStatus: PurchaseStatus) {
    const res = await fetch(`/api/admin/purchases/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p)));
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  function toggleSort(field: SortField) {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="min-h-screen px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">FFA Rank Shop</p>
            <h1 className="mt-1 text-3xl font-bold">
              <span className="gradient-text">Purchases</span>
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur-xl transition-colors hover:text-white"
          >
            Log out
          </button>
        </div>

        <div className="glass mt-6 flex flex-wrap gap-3 rounded-2xl p-4">
          <input
            type="text"
            placeholder="Search IGN or Purchase ID"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="min-w-[220px] flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-indigo-400/50"
          />
          <select
            value={rank}
            onChange={(e) => {
              setRank(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-white/10 bg-[#0b0d12] px-3 py-2 text-sm"
          >
            <option value="">All ranks</option>
            <option value="vip">VIP</option>
            <option value="custom">Custom</option>
          </select>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-white/10 bg-[#0b0d12] px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="refunded">Refunded</option>
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-white/10 bg-[#0b0d12] px-3 py-2 text-sm"
          />
          <span className="self-center text-slate-500">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-white/10 bg-[#0b0d12] px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <div className="glass mt-6 overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <SortableHeader label="Purchase ID" field="id" sortBy={sortBy} sortDir={sortDir} onClick={toggleSort} />
                <SortableHeader label="IGN" field="ign" sortBy={sortBy} sortDir={sortDir} onClick={toggleSort} />
                <SortableHeader label="Rank" field="rank" sortBy={sortBy} sortDir={sortDir} onClick={toggleSort} />
                <SortableHeader
                  label="Date/Time"
                  field="createdAt"
                  sortBy={sortBy}
                  sortDir={sortDir}
                  onClick={toggleSort}
                />
                <th className="px-4 py-3 font-medium">Amount</th>
                <SortableHeader label="Status" field="status" sortBy={sortBy} sortDir={sortDir} onClick={toggleSort} />
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No purchases found.
                  </td>
                </tr>
              )}
              {!loading &&
                items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{item.id}</td>
                    <td className="px-4 py-3">{item.ign}</td>
                    <td className="px-4 py-3 uppercase">{item.rank}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">${item.amount}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[item.status]}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value as PurchaseStatus)}
                        className="rounded-md border border-white/10 bg-[#0b0d12] px-2 py-1 text-xs"
                      >
                        <option value="active">Active</option>
                        <option value="expired">Expired</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
          <span>
            {total} total purchase{total === 1 ? "" : "s"}
          </span>
          <div className="flex items-center gap-3">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-white/10 px-3 py-1.5 disabled:opacity-40"
            >
              Prev
            </button>
            <span>
              Page {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-white/10 px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SortableHeader({
  label,
  field,
  sortBy,
  sortDir,
  onClick,
}: {
  label: string;
  field: SortField;
  sortBy: SortField;
  sortDir: "asc" | "desc";
  onClick: (field: SortField) => void;
}) {
  const active = sortBy === field;
  return (
    <th
      onClick={() => onClick(field)}
      className="cursor-pointer select-none px-4 py-3 font-medium hover:text-white"
    >
      {label} {active ? (sortDir === "asc" ? "↑" : "↓") : ""}
    </th>
  );
}
