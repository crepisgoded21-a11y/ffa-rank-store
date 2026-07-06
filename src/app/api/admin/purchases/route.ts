import { requireAdminSession } from "../../../../lib/adminSession";
import { listPurchases, type PurchaseStatus } from "../../../../lib/purchaseHistory";

export async function GET(request: Request) {
  if (!(await requireAdminSession())) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const url = new URL(request.url);
  const params = url.searchParams;

  const search = params.get("search") ?? undefined;
  const rank = params.get("rank") ?? undefined;
  const statusParam = params.get("status");
  const status: PurchaseStatus | undefined =
    statusParam === "active" || statusParam === "expired" || statusParam === "refunded"
      ? statusParam
      : undefined;
  const dateFrom = params.get("dateFrom") ? Number(params.get("dateFrom")) : undefined;
  const dateTo = params.get("dateTo") ? Number(params.get("dateTo")) : undefined;
  const sortByParam = params.get("sortBy");
  const sortBy =
    sortByParam === "createdAt" ||
    sortByParam === "ign" ||
    sortByParam === "rank" ||
    sortByParam === "status" ||
    sortByParam === "id"
      ? sortByParam
      : undefined;
  const sortDir = params.get("sortDir") === "asc" ? "asc" : undefined;
  const page = params.get("page") ? Number(params.get("page")) : undefined;
  const pageSize = params.get("pageSize") ? Number(params.get("pageSize")) : undefined;

  const result = await listPurchases({
    search,
    rank,
    status,
    dateFrom,
    dateTo,
    sortBy,
    sortDir,
    page,
    pageSize,
  });

  return Response.json(result);
}
