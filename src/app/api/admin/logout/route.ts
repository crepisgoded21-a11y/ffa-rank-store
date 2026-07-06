import { clearAdminSessionCookie } from "../../../../lib/adminSession";

export async function POST() {
  await clearAdminSessionCookie();
  return Response.json({ status: "ok" });
}
