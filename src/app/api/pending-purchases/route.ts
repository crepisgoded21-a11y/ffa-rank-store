import { listPendingPurchases } from "../../../lib/store";

function isAuthorized(request: Request): boolean {
  const apiKey = process.env.RANKSHOP_API_KEY;
  if (!apiKey) return true; // no key configured -> auth disabled
  return request.headers.get("authorization") === `Bearer ${apiKey}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  const purchases = await listPendingPurchases();
  return Response.json(purchases);
}
