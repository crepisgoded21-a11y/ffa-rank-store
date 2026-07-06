import { ackPendingPurchase } from "../../../../lib/store";

function isAuthorized(request: Request): boolean {
  const apiKey = process.env.RANKSHOP_API_KEY;
  if (!apiKey) return true;
  return request.headers.get("authorization") === `Bearer ${apiKey}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const id = (body as Record<string, unknown> | null)?.id;
  if (typeof id !== "string" || !id) {
    return Response.json({ error: "Missing id." }, { status: 400 });
  }

  await ackPendingPurchase(id);
  return Response.json({ status: "ok" });
}
