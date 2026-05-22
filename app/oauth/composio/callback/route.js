import { NextResponse } from "next/server";
import { getComposio, hasComposioConfig } from "../../../../lib/composio";
import { getRedis, hasRedisConfig } from "../../../../lib/redis";
import { errorPage, getConnectionCodeKey, getOAuthStateKey, isValidState } from "../../../../lib/oauth";

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const state = requestUrl.searchParams.get("state");
  const status = requestUrl.searchParams.get("status");
  const connectedAccountId = requestUrl.searchParams.get("connected_account_id");

  if (!isValidState(state)) {
    return errorPage("Missing callback data", "The connection service returned without the state Rocky needs.");
  }

  if (!hasComposioConfig() || !hasRedisConfig()) {
    return errorPage("Connection unavailable", "Rocky's connection service is not configured yet.", 503);
  }

  const redis = getRedis();
  const stateKey = getOAuthStateKey(state);
  const savedState = await redis.get(stateKey);

  if (!savedState?.provider || !savedState?.redirect_uri || !savedState?.rocky_entity_id) {
    return errorPage(
      "Connection expired",
      "This connection expired. Return to Rocky and try again.",
      410
    );
  }

  if (status !== "success" || !connectedAccountId) {
    await redis.del(stateKey);
    return errorPage("Connection not completed", "The service connection did not finish. Return to Rocky and try again.");
  }

  let connectedAccount = null;

  try {
    connectedAccount = await getComposio().connectedAccounts.waitForConnection(connectedAccountId, 20000);
  } catch {
    return errorPage("Connection not ready", "Rocky could not confirm this service connection yet. Please try again.");
  }

  const connectionCode = crypto.randomUUID();

  await redis.set(
    getConnectionCodeKey(connectionCode),
    {
      provider: savedState.provider,
      composio_entity_id: savedState.rocky_entity_id,
      composio_connected_account_id: connectedAccount.id || connectedAccountId,
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
