import { NextResponse } from "next/server";
import { getRedis, hasRedisConfig } from "../../../../lib/redis";
import { getConnectionCodeKey, isSupportedProvider } from "../../../../lib/oauth";

export async function POST(request) {
  let body = null;

  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const provider = body?.provider;
  const code = body?.code;

  if (!isSupportedProvider(provider)) {
    return NextResponse.json({ ok: false, error: "unsupported_provider" }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ ok: false, error: "missing_code" }, { status: 400 });
  }

  if (!hasRedisConfig()) {
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
    token: stored.connection,
    connection: stored.connection,
  });
}
