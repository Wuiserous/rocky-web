import { NextResponse } from "next/server";
import { getComposio, hasComposioConfig } from "../../../lib/composio";
import { getRedis, hasRedisConfig } from "../../../lib/redis";
import {
  COMPOSIO_CALLBACK_URL,
  errorPage,
  getOAuthStateKey,
  isValidDesktopRedirectUri,
  isValidState,
} from "../../../lib/oauth";
import { getRockyProviderConfig } from "../../../lib/rocky-connections";

export async function GET(request, { params }) {
  const { provider } = await params;
  const providerConfig = getRockyProviderConfig(provider);
  const requestUrl = new URL(request.url);
  const redirectUri = requestUrl.searchParams.get("redirect_uri");
  const state = requestUrl.searchParams.get("state");

  if (!providerConfig) {
    return errorPage("Unsupported provider", "Rocky cannot connect this service yet.", 404);
  }

  if (!redirectUri || !isValidDesktopRedirectUri(redirectUri)) {
    return errorPage(
      "Invalid redirect",
      "Rocky received an invalid desktop callback URL. Please update the Rocky desktop app and try again."
    );
  }

  if (!isValidState(state)) {
    return errorPage("Invalid state", "Rocky could not start this connection because its request state is invalid.");
  }

  if (!hasComposioConfig() || !hasRedisConfig() || !providerConfig.authConfigId) {
    return errorPage("Connection unavailable", "Rocky's connection service is not configured yet.", 503);
  }

  const rockyEntityId = `rocky_${crypto.randomUUID()}`;
  const redis = getRedis();
  const callbackUrl = new URL(COMPOSIO_CALLBACK_URL);
  callbackUrl.searchParams.set("state", state);

  await redis.set(
    getOAuthStateKey(state),
    {
      provider,
      redirect_uri: redirectUri,
      rocky_entity_id: rockyEntityId,
      created_at: new Date().toISOString(),
    },
    { ex: 600 }
  );

  try {
    const connectionRequest = await getComposio().connectedAccounts.link(
      rockyEntityId,
      providerConfig.authConfigId,
      {
        callbackUrl: callbackUrl.toString(),
      }
    );

    if (!connectionRequest.redirectUrl) {
      throw new Error("Composio did not return a connect URL.");
    }

    return NextResponse.redirect(connectionRequest.redirectUrl);
  } catch {
    await redis.del(getOAuthStateKey(state));
    return errorPage("Connection unavailable", "Rocky could not start this service connection. Please try again.", 502);
  }
}
