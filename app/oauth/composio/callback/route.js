import { NextResponse } from "next/server";
import { getComposio, hasComposioConfig } from "../../../../lib/composio";
import { getRedis, hasRedisConfig } from "../../../../lib/redis";
import { errorPage, getConnectionCodeKey, getOAuthStateKey } from "../../../../lib/oauth";

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const state = requestUrl.searchParams.get("state");
  const connectionError = requestUrl.searchParams.get("error");

  if (connectionError) {
    return errorPage("Connection cancelled", "The service did not complete the authorization request.");
  }

  if (!state) {
    return errorPage("Missing callback data", "The connection service returned without the state Rocky needs.");
  }

  if (!hasComposioConfig() || !hasRedisConfig()) {
    return errorPage("Connection unavailable", "Rocky's connection service is not configured yet.", 503);
  }

  const redis = getRedis();
  const stateKey = getOAuthStateKey(state);
  const savedState = await redis.get(stateKey);

  if (!savedState?.provider || !savedState?.redirect_uri || !savedState?.connected_account_id) {
    return errorPage(
      "Connection expired",
      "This Rocky connection request expired or was already used. Please start the connection again from the desktop app.",
      410
    );
  }

  const composio = getComposio();
  let connectedAccount = null;

  try {
    connectedAccount = await composio.connectedAccounts.waitForConnection(
      savedState.connected_account_id,
      20000
    );
  } catch {
    return errorPage("Connection not ready", "Rocky could not confirm this service connection yet. Please try again.");
  }

  const connectionCode = crypto.randomUUID();
  const connection = {
    provider: savedState.provider,
    toolkit: savedState.toolkit,
    composio_user_id: savedState.composio_user_id,
    session_id: savedState.session_id,
    connected_account_id: connectedAccount.id || savedState.connected_account_id,
    created_at: new Date().toISOString(),
  };

  await redis.set(
    getConnectionCodeKey(connectionCode),
    {
      provider: savedState.provider,
      connection,
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
