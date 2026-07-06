import bcrypt from "bcryptjs";
import { setAdminSessionCookie } from "../../../../lib/adminSession";
import { checkRateLimit, recordFailedAttempt, clearRateLimit, getClientIp } from "../../../../lib/rateLimit";

export async function POST(request: Request) {
  const ip = getClientIp(request);

  const rateLimit = await checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds ?? 900) } }
    );
  }

  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username : "";
  const password = typeof body?.password === "string" ? body.password : "";

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminUsername || !adminPasswordHash) {
    return Response.json({ error: "Admin credentials are not configured." }, { status: 500 });
  }

  // Constant-shape comparison: always run bcrypt.compare even on a username
  // mismatch, so response timing doesn't reveal whether the username is valid.
  const usernameMatches = username === adminUsername;
  const passwordMatches = await bcrypt.compare(password || "", adminPasswordHash);

  if (!usernameMatches || !passwordMatches) {
    await recordFailedAttempt(ip);
    return Response.json({ error: "Invalid username or password." }, { status: 401 });
  }

  await clearRateLimit(ip);
  await setAdminSessionCookie();
  return Response.json({ status: "ok" });
}
