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
  const debug = requestUrl.searchParams.get("debug") === "1";

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

  const rockyEntityId = `rocky-${crypto.randomUUID()}`;
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
    const composio = getComposio();
    let connectionRequest = null;
    let linkError = null;

    try {
      connectionRequest = await composio.connectedAccounts.link(
        rockyEntityId,
        providerConfig.authConfigId,
        {
          callbackUrl: callbackUrl.toString(),
          allowMultiple: true,
        }
      );
    } catch (error) {
      linkError = error;
      if (typeof composio.connectedAccounts.initiate === "function") {
        connectionRequest = await composio.connectedAccounts.initiate(
          rockyEntityId,
          providerConfig.authConfigId,
          {
            callbackUrl: callbackUrl.toString(),
            allowMultiple: true,
          }
        );
      } else {
        throw error;
      }
    }

    if (!connectionRequest.redirectUrl) {
      throw new Error("Composio did not return a connect URL.");
    }

    if (linkError) {
      console.warn("Composio connectedAccounts.link failed; initiate fallback succeeded", {
        provider,
        authConfigEnv: providerConfig.authConfigEnv,
        errorName: linkError?.name,
        errorMessage: linkError?.message,
        causeName: linkError?.cause?.name,
        causeMessage: linkError?.cause?.message,
        status: linkError?.status || linkError?.cause?.status,
      });
    }

    return NextResponse.redirect(connectionRequest.redirectUrl);
  } catch (error) {
    console.error("Composio connectedAccounts.link failed", {
      provider,
      authConfigEnv: providerConfig.authConfigEnv,
      authConfigIdPrefix: providerConfig.authConfigId?.slice(0, 6),
      authConfigIdSuffix: providerConfig.authConfigId?.slice(-4),
      callbackUrl: callbackUrl.toString(),
      errorName: error?.name,
      errorMessage: error?.message,
      causeName: error?.cause?.name,
      causeMessage: error?.cause?.message,
      status: error?.status || error?.cause?.status,
    });

    await redis.del(getOAuthStateKey(state));
    if (debug) {
      const diagnostic = {
        provider,
        authConfigEnv: providerConfig.authConfigEnv,
        authConfigIdPrefix: providerConfig.authConfigId?.slice(0, 6),
        authConfigIdSuffix: providerConfig.authConfigId?.slice(-4),
        callbackUrl: callbackUrl.toString(),
        errorName: error?.name,
        errorMessage: error?.message,
        causeName: error?.cause?.name,
        causeMessage: error?.cause?.message,
        status: error?.status || error?.cause?.status,
      };
      return NextResponse.json({ ok: false, error: "connect_start_failed", diagnostic }, { status: 502 });
    }

    return errorPage("Connection unavailable", "Rocky could not start this service connection. Please try again.", 502);
  }
}
