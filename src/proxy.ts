import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminSessionToken, ADMIN_SESSION_COOKIE_NAME } from "./lib/adminSession";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminApi = pathname.startsWith("/api/admin/") && pathname !== "/api/admin/login";
  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";

  if (!isAdminApi && !isAdminPage) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const valid = await verifyAdminSessionToken(token);

  if (valid) {
    return NextResponse.next();
  }

  if (isAdminApi) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
