import { requireAdminSession } from "../../../../../lib/adminSession";
import { updatePurchaseStatus, type PurchaseStatus } from "../../../../../lib/purchaseHistory";

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/purchases/[id]">) {
  if (!(await requireAdminSession())) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const status = body?.status as PurchaseStatus | undefined;

  if (status !== "active" && status !== "expired" && status !== "refunded") {
    return Response.json({ error: "Invalid status." }, { status: 400 });
  }

  const updated = await updatePurchaseStatus(id, status);
  if (!updated) {
    return Response.json({ error: "Purchase not found." }, { status: 404 });
  }

  return Response.json(updated);
}
