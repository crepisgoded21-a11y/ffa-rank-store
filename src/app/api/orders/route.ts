import { createOrder, RANK_PRICES } from "../../../lib/paypal";
import { isValidIgn, isValidHexColor, validateNickname } from "../../../lib/validate";
import { corsJson, corsPreflight } from "../../../lib/cors";

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return corsJson({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { ign, rank, nickname, color } = body as Record<string, unknown>;

  if (!isValidIgn(ign)) {
    return corsJson({ error: "Invalid IGN." }, { status: 400 });
  }
  if (typeof rank !== "string" || !RANK_PRICES[rank]) {
    return corsJson({ error: "Invalid rank." }, { status: 400 });
  }

  if (rank === "custom") {
    const nicknameCheck = validateNickname(nickname);
    if (!nicknameCheck.ok) {
      return corsJson({ error: nicknameCheck.reason }, { status: 400 });
    }
    if (!isValidHexColor(color)) {
      return corsJson({ error: "Invalid color." }, { status: 400 });
    }
  }

  try {
    const orderId = await createOrder({
      ign,
      rank,
      nickname: rank === "custom" ? (nickname as string) : undefined,
      color: rank === "custom" ? (color as string) : undefined,
    });
    return corsJson({ id: orderId });
  } catch (err) {
    return corsJson(
      { error: err instanceof Error ? err.message : "Failed to create order." },
      { status: 502 }
    );
  }
}
