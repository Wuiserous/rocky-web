import { NextResponse } from "next/server";
import { getComposio, hasComposioConfig } from "../../../../lib/composio";
import { getToolkitForProvider, isSupportedProvider } from "../../../../lib/oauth";

export async function POST(request) {
  let body = null;

  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const provider = body?.provider;
  const connection = body?.connection || body?.token;
  const action = body?.action || body?.tool;
  const args = body?.arguments || body?.args || body?.params || {};

  if (!isSupportedProvider(provider)) {
    return NextResponse.json({ ok: false, error: "unsupported_provider" }, { status: 400 });
  }

  if (!connection?.session_id || !connection?.connected_account_id) {
    return NextResponse.json({ ok: false, error: "missing_connection" }, { status: 400 });
  }

  if (connection.provider && connection.provider !== provider) {
    return NextResponse.json({ ok: false, error: "provider_mismatch" }, { status: 400 });
  }

  if (!action || typeof action !== "string") {
    return NextResponse.json({ ok: false, error: "missing_action" }, { status: 400 });
  }

  if (!hasComposioConfig()) {
    return NextResponse.json({ ok: false, error: "broker_not_configured" }, { status: 503 });
  }

  try {
    const composio = getComposio();
    const session = await composio.use(connection.session_id);
    const result = await session.execute(action, args, {
      account: connection.connected_account_id,
    });

    return NextResponse.json({
      ok: true,
      provider,
      toolkit: connection.toolkit || getToolkitForProvider(provider),
      result,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "composio_call_failed" }, { status: 502 });
  }
}
