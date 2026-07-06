import { captureOrder } from "../../../../../lib/paypal";
import { addPendingPurchase, hasPendingPurchase } from "../../../../../lib/store";

export async function POST(_request: Request, ctx: RouteContext<"/api/orders/[orderId]/capture">) {
  const { orderId } = await ctx.params;

  let captured;
  try {
    captured = await captureOrder(orderId);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to capture order." },
      { status: 502 }
    );
  }

  if (captured.status !== "COMPLETED") {
    return Response.json({ error: `Payment not completed (status: ${captured.status}).` }, { status: 402 });
  }
  if (!captured.custom) {
    return Response.json({ error: "Payment completed but order data was missing." }, { status: 500 });
  }

  if (!(await hasPendingPurchase(orderId))) {
    await addPendingPurchase({ id: orderId, ...captured.custom });
  }

  return Response.json({ status: "ok" });
}
