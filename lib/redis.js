import { Redis } from "@upstash/redis";

let redis = null;

export function getRedisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  return { url, token };
}

export function hasRedisConfig() {
  const { url, token } = getRedisConfig();
  return Boolean(url && token);
}

export function getRedis() {
  const { url, token } = getRedisConfig();

  if (!url || !token) {
    throw new Error("Redis environment variables are not configured.");
  }

  if (!redis) {
    redis = new Redis({
      url,
      token,
    });
  }

  return redis;
}
