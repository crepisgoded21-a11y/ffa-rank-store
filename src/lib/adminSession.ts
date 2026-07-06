import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE = "admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12; // 12 hours

function getSecretKey(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured.");
  }
  return new TextEncoder().encode(secret);
}

export async function createAdminSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifyAdminSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: ["HS256"] });
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function setAdminSessionCookie(): Promise<void> {
  const token = await createAdminSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Defense-in-depth check for use directly inside Route Handlers, in addition
 * to proxy.ts. Route Handlers must not rely on proxy.ts alone.
 */
export async function requireAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

export const ADMIN_SESSION_COOKIE_NAME = SESSION_COOKIE;
