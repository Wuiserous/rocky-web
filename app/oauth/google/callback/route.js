import { NextResponse } from "next/server";
import { getRedis } from "../../../../lib/redis";
import {
  GOOGLE_CALLBACK_URL,
  errorPage,
  envReady,
  getConnectionCodeKey,
  getOAuthStateKey,
} from "../../../../lib/oauth";

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const oauthError = requestUrl.searchParams.get("error");

  if (oauthError) {
    return errorPage("Google connection cancelled", "Google did not complete the authorization request.");
  }

  if (!code || !state) {
    return errorPage("Missing callback data", "Google returned without the information Rocky needs to finish connecting.");
  }

  if (
    !envReady(
      "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET",
      "CONNECTION_CODE_SECRET",
      "UPSTASH_REDIS_REST_URL",
      "UPSTASH_REDIS_REST_TOKEN"
    )
  ) {
    return errorPage("Connection unavailable", "Rocky's Google connection service is not configured yet.", 503);
  }

  const redis = getRedis();
  const stateKey = getOAuthStateKey(state);
  const savedState = await redis.get(stateKey);

  if (!savedState?.provider || !savedState?.redirect_uri) {
    return errorPage(
      "Connection expired",
      "This Rocky connection request expired or was already used. Please start the connection again from the desktop app.",
      410
    );
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_CALLBACK_URL,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) {
    await redis.del(stateKey);
    return errorPage("Google token exchange failed", "Rocky could not finish connecting Google. Please try again.");
  }

  const token = await tokenResponse.json();
  const connectionCode = crypto.randomUUID();

  await redis.set(
    getConnectionCodeKey(connectionCode),
    {
      provider: savedState.provider,
      token,
      created_at: new Date().toISOString(),
    },
    { ex: 300 }
  );
  await redis.del(stateKey);

  const desktopRedirect = new URL(savedState.redirect_uri);
  desktopRedirect.searchParams.set("connection_code", connectionCode);
  desktopRedirect.searchParams.set("state", state);

  return NextResponse.redirect(desktopRedirect);
}
