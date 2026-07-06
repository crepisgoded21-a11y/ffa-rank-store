import { createOrder, RANK_PRICES } from "../../../lib/paypal";
import { isValidIgn, isValidHexColor, validateNickname } from "../../../lib/validate";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { ign, rank, nickname, color } = body as Record<string, unknown>;

  if (!isValidIgn(ign)) {
    return Response.json({ error: "Invalid IGN." }, { status: 400 });
  }
  if (typeof rank !== "string" || !RANK_PRICES[rank]) {
    return Response.json({ error: "Invalid rank." }, { status: 400 });
  }

  if (rank === "custom") {
    const nicknameCheck = validateNickname(nickname);
    if (!nicknameCheck.ok) {
      return Response.json({ error: nicknameCheck.reason }, { status: 400 });
    }
    if (!isValidHexColor(color)) {
      return Response.json({ error: "Invalid color." }, { status: 400 });
    }
  }

  try {
    const orderId = await createOrder({
      ign,
      rank,
      nickname: rank === "custom" ? (nickname as string) : undefined,
      color: rank === "custom" ? (color as string) : undefined,
    });
    return Response.json({ id: orderId });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to create order." },
      { status: 502 }
    );
  }
}
