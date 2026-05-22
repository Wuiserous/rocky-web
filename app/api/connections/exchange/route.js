import { NextResponse } from "next/server";
import { getRedis } from "../../../../lib/redis";
import { envReady, getConnectionCodeKey, isSupportedGoogleProvider } from "../../../../lib/oauth";

export async function POST(request) {
  let body = null;

  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const provider = body?.provider;
  const code = body?.code;

  if (!isSupportedGoogleProvider(provider)) {
    return NextResponse.json({ ok: false, error: "unsupported_provider" }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ ok: false, error: "missing_code" }, { status: 400 });
  }

  if (!envReady("CONNECTION_CODE_SECRET", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN")) {
    return NextResponse.json({ ok: false, error: "broker_not_configured" }, { status: 503 });
  }

  const redis = getRedis();
  const codeKey = getConnectionCodeKey(code);
  const stored = await redis.get(codeKey);

  if (!stored) {
    return NextResponse.json({ ok: false, error: "invalid_or_expired_code" });
  }

  if (stored.provider !== provider) {
    return NextResponse.json({ ok: false, error: "provider_mismatch" }, { status: 400 });
  }

  await redis.del(codeKey);

  return NextResponse.json({
    ok: true,
    token: stored.token,
  });
}
