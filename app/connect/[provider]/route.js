import { NextResponse } from "next/server";
import { getRedis, hasRedisConfig } from "../../../lib/redis";
import {
  GOOGLE_CALLBACK_URL,
  GOOGLE_PROVIDER_SCOPES,
  errorPage,
  envReady,
  getOAuthStateKey,
  isSupportedGoogleProvider,
  isValidDesktopRedirectUri,
} from "../../../lib/oauth";

export async function GET(request, { params }) {
  const { provider } = await params;
  const requestUrl = new URL(request.url);
  const redirectUri = requestUrl.searchParams.get("redirect_uri");
  const state = requestUrl.searchParams.get("state");

  if (!isSupportedGoogleProvider(provider)) {
    return errorPage("Unsupported provider", "Rocky can connect Google Sheets and Gmail here right now.", 404);
  }

  if (!redirectUri || !isValidDesktopRedirectUri(redirectUri)) {
    return errorPage(
      "Invalid redirect",
      "Rocky received an invalid desktop callback URL. Please update the Rocky desktop app and try again."
    );
  }

  if (!state) {
    return errorPage("Missing state", "Rocky could not start this connection because the request state was missing.");
  }

  if (
    !envReady(
      "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET",
      "CONNECTION_CODE_SECRET"
    )
    || !hasRedisConfig()
  ) {
    return errorPage("Connection unavailable", "Rocky's Google connection service is not configured yet.", 503);
  }

  const redis = getRedis();
  await redis.set(
    getOAuthStateKey(state),
    {
      provider,
      redirect_uri: redirectUri,
      created_at: new Date().toISOString(),
    },
    { ex: 600 }
  );

  const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID);
  googleUrl.searchParams.set("redirect_uri", GOOGLE_CALLBACK_URL);
  googleUrl.searchParams.set("response_type", "code");
  googleUrl.searchParams.set("scope", GOOGLE_PROVIDER_SCOPES[provider].join(" "));
  googleUrl.searchParams.set("state", state);
  googleUrl.searchParams.set("access_type", "offline");
  googleUrl.searchParams.set("prompt", "consent");

  return NextResponse.redirect(googleUrl);
}
