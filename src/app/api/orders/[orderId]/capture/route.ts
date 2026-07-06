import { captureOrder, RANK_PRICES } from "../../../../../lib/paypal";
import { addPendingPurchase, hasPendingPurchase } from "../../../../../lib/store";
import { corsJson, corsPreflight } from "../../../../../lib/cors";
import { purchaseRecordExists, recordPurchase } from "../../../../../lib/purchaseHistory";

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(_request: Request, ctx: RouteContext<"/api/orders/[orderId]/capture">) {
  const { orderId } = await ctx.params;

  let captured;
  try {
    captured = await captureOrder(orderId);
  } catch (err) {
    return corsJson(
      { error: err instanceof Error ? err.message : "Failed to capture order." },
      { status: 502 }
    );
  }

  if (captured.status !== "COMPLETED") {
    return corsJson({ error: `Payment not completed (status: ${captured.status}).` }, { status: 402 });
  }
  if (!captured.custom) {
    return corsJson({ error: "Payment completed but order data was missing." }, { status: 500 });
  }

  if (!(await hasPendingPurchase(orderId))) {
    await addPendingPurchase({ id: orderId, ...captured.custom });
  }

  if (!(await purchaseRecordExists(orderId))) {
    await recordPurchase({
      id: orderId,
      ign: captured.custom.ign,
      rank: captured.custom.rank,
      nickname: captured.custom.nickname,
      color: captured.custom.color,
      amount: RANK_PRICES[captured.custom.rank] ?? "0.00",
    });
  }

  return corsJson({ status: "ok" });
}
