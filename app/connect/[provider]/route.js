import { NextResponse } from "next/server";
import { getComposio, hasComposioConfig } from "../../../lib/composio";
import { getRedis, hasRedisConfig } from "../../../lib/redis";
import {
  COMPOSIO_CALLBACK_URL,
  errorPage,
  getOAuthStateKey,
  getToolkitForProvider,
  isSupportedProvider,
  isValidDesktopRedirectUri,
} from "../../../lib/oauth";

export async function GET(request, { params }) {
  const { provider } = await params;
  const requestUrl = new URL(request.url);
  const redirectUri = requestUrl.searchParams.get("redirect_uri");
  const state = requestUrl.searchParams.get("state");

  if (!isSupportedProvider(provider)) {
    return errorPage("Unsupported provider", "Rocky cannot connect this service yet.", 404);
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

  if (!hasComposioConfig() || !hasRedisConfig()) {
    return errorPage("Connection unavailable", "Rocky's connection service is not configured yet.", 503);
  }

  const toolkit = getToolkitForProvider(provider);
  const userId = `rocky_${crypto.randomUUID()}`;
  const redis = getRedis();
  const composio = getComposio();

  let session = null;
  let connectionRequest = null;

  try {
    session = await composio.create(userId, {
      toolkits: [toolkit],
      manageConnections: {
        enable: true,
        callbackUrl: COMPOSIO_CALLBACK_URL,
      },
    });

    const callbackUrl = new URL(COMPOSIO_CALLBACK_URL);
    callbackUrl.searchParams.set("state", state);

    connectionRequest = await session.authorize(toolkit, {
      callbackUrl: callbackUrl.toString(),
    });
  } catch {
    return errorPage("Connection unavailable", "Rocky could not start this service connection. Please try again.", 502);
  }

  if (!connectionRequest.redirectUrl) {
    return errorPage("Connection unavailable", "Rocky could not start this service connection. Please try again.", 502);
  }

  await redis.set(
    getOAuthStateKey(state),
    {
      provider,
      toolkit,
      redirect_uri: redirectUri,
      composio_user_id: userId,
      session_id: session.sessionId,
      connected_account_id: connectionRequest.id,
      created_at: new Date().toISOString(),
    },
    { ex: 600 }
  );

  return NextResponse.redirect(connectionRequest.redirectUrl);
}
