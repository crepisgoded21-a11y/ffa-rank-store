// The store site (docs/index.html) is served from a different origin
// (effectsffa.xyz / github.io) than this backend (a Vercel deployment), so
// browser fetch() calls to these routes need explicit CORS headers or the
// browser silently blocks the response before the caller ever sees it.
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function corsJson(data: unknown, init?: ResponseInit): Response {
  return Response.json(data, {
    ...init,
    headers: { ...CORS_HEADERS, ...(init?.headers ?? {}) },
  });
}

export function corsPreflight(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
