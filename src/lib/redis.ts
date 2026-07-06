import { Redis } from "@upstash/redis";

let client: Redis | null = null;

export function redis(): Redis {
  if (client) return client;

  // Vercel's Redis marketplace integrations inject either the native Upstash
  // env var names or the legacy Vercel KV names depending on how the
  // integration was added — support both.
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    throw new Error(
      "No Redis connection found. Connect an Upstash Redis (or Vercel KV) integration to this project."
    );
  }

  client = new Redis({ url, token });
  return client;
}
