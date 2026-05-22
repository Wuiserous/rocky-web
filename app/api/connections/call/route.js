import { NextResponse } from "next/server";
import { getComposio, hasComposioConfig } from "../../../../lib/composio";
import { getRockyProviderConfig } from "../../../../lib/rocky-connections";

const MAX_RESPONSE_BYTES = 256000;
const TOOL_LIST_LIMIT = 80;

function cappedJson(payload, status = 200) {
  const json = JSON.stringify(payload);

  if (Buffer.byteLength(json, "utf8") > MAX_RESPONSE_BYTES) {
    return NextResponse.json({ ok: false, error: "response_too_large" }, { status: 502 });
  }

  return new Response(json, {
    status,
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
    },
  });
}

function compactTool(tool) {
  return {
    slug: tool.slug,
    name: tool.name,
    description: tool.description,
    toolkit: tool.toolkit?.slug || tool.toolkitSlug || tool.toolkit,
  };
}

export async function POST(request) {
  let body = null;

  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const providerConfig = getRockyProviderConfig(body?.provider);
  const entityId = body?.entity_id;
  const connectedAccountId = body?.connected_account_id;
  const operation = body?.operation;

  if (!providerConfig) {
    return NextResponse.json({ ok: false, error: "unsupported_provider" }, { status: 400 });
  }

  if (!entityId || typeof entityId !== "string") {
    return NextResponse.json({ ok: false, error: "missing_entity_id" }, { status: 400 });
  }

  if (!operation || typeof operation !== "object") {
    return NextResponse.json({ ok: false, error: "missing_operation" }, { status: 400 });
  }

  if (!hasComposioConfig() || !providerConfig.authConfigId) {
    return NextResponse.json({ ok: false, error: "broker_not_configured" }, { status: 503 });
  }

  try {
    const composio = getComposio();

    if (operation.type === "tools_list") {
      const tools = await composio.tools.getRawComposioTools({
        authConfigIds: [providerConfig.authConfigId],
        toolkits: [providerConfig.toolkit],
        limit: TOOL_LIST_LIMIT,
      });
      const items = Array.isArray(tools?.items) ? tools.items : Array.isArray(tools) ? tools : [];

      return cappedJson({
        ok: true,
        provider: providerConfig.id,
        tools: items.map(compactTool),
      });
    }

    if (operation.type === "tool_execute") {
      if (!operation.tool_slug || typeof operation.tool_slug !== "string") {
        return NextResponse.json({ ok: false, error: "missing_tool_slug" }, { status: 400 });
      }

      const result = await composio.tools.execute(operation.tool_slug, {
        userId: entityId,
        ...(connectedAccountId ? { connectedAccountId } : {}),
        arguments: operation.arguments || {},
        dangerouslySkipVersionCheck: true,
      });

      return cappedJson({
        ok: true,
        provider: providerConfig.id,
        result,
      });
    }

    return NextResponse.json({ ok: false, error: "unsupported_operation" }, { status: 400 });
  } catch {
    return NextResponse.json({ ok: false, error: "composio_call_failed" }, { status: 502 });
  }
}
