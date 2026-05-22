import { NextResponse } from "next/server";
import { getComposio, hasComposioConfig } from "../../../../lib/composio";
import { getRockyProviderConfig } from "../../../../lib/rocky-connections";

const MAX_RESPONSE_BYTES = 256000;
const TOOL_LIST_LIMIT = 80;
const GMAIL_FETCH_EMAILS_TOOL = "GMAIL_FETCH_EMAILS";
const GMAIL_SUMMARY_LIMIT = 10;

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

function cleanString(value, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed || fallback;
}

function normalizeTimestamp(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    const milliseconds = value > 10_000_000_000 ? value : value * 1000;
    return new Date(milliseconds).toISOString();
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return "Unknown time";
    }

    if (/^\d+$/.test(trimmed)) {
      const numeric = Number(trimmed);
      if (Number.isFinite(numeric)) {
        const milliseconds = numeric > 10_000_000_000 ? numeric : numeric * 1000;
        return new Date(milliseconds).toISOString();
      }
    }

    const parsed = Date.parse(trimmed);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toISOString();
    }

    return trimmed;
  }

  return "Unknown time";
}

function dedupeMessageCandidates(candidates) {
  const seen = new Set();
  const unique = [];

  for (const candidate of candidates) {
    const id = cleanString(
      candidate.id || candidate.messageId || candidate.message_id || candidate.gmailMessageId,
      ""
    );
    const subject = cleanString(candidate.subject || candidate.title || candidate.snippet, "");
    const sender = cleanString(
      candidate.sender || candidate.from || candidate.from_email || candidate.sender_email,
      ""
    );
    const key = [id, subject, sender].filter(Boolean).join("::");

    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(candidate);
  }

  return unique;
}

function collectMessageCandidates(value, candidates = [], seen = new WeakSet()) {
  if (!value || typeof value !== "object") {
    return candidates;
  }

  if (seen.has(value)) {
    return candidates;
  }
  seen.add(value);

  if (Array.isArray(value)) {
    for (const item of value) {
      collectMessageCandidates(item, candidates, seen);
    }
    return candidates;
  }

  const looksLikeMessage =
    "subject" in value ||
    "snippet" in value ||
    "from" in value ||
    "sender" in value ||
    "messageId" in value ||
    "message_id" in value ||
    "id" in value;

  if (looksLikeMessage) {
    candidates.push(value);
  }

  for (const nested of Object.values(value)) {
    collectMessageCandidates(nested, candidates, seen);
  }

  return candidates;
}

function normalizeGmailMessages(result, fallbackLimit) {
  const rawCandidates = dedupeMessageCandidates(collectMessageCandidates(result));

  return rawCandidates.slice(0, fallbackLimit).map((message, index) => ({
    id: cleanString(
      message.id || message.messageId || message.message_id || message.gmailMessageId,
      `message_${index + 1}`
    ),
    sender: cleanString(
      message.sender ||
        message.from ||
        message.from_email ||
        message.sender_email ||
        message.email_from,
      "Unknown sender"
    ),
    subject: cleanString(message.subject || message.title, "(No subject)"),
    timestamp: normalizeTimestamp(
      message.timestamp ||
        message.internalDate ||
        message.internal_date ||
        message.receivedAt ||
        message.date ||
        message.created_at
    ),
    snippet: cleanString(
      message.snippet ||
        message.preview ||
        message.bodyPreview ||
        message.body_preview ||
        message.summary ||
        message.textPlain ||
        message.text,
      ""
    ),
  }));
}

async function executeTool(composio, entityId, connectedAccountId, toolSlug, args) {
  return composio.tools.execute(toolSlug, {
    userId: entityId,
    ...(connectedAccountId ? { connectedAccountId } : {}),
    arguments: args || {},
    dangerouslySkipVersionCheck: true,
  });
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

      const result = await executeTool(
        composio,
        entityId,
        connectedAccountId,
        operation.tool_slug,
        operation.arguments || {}
      );

      return cappedJson({
        ok: true,
        provider: providerConfig.id,
        result,
      });
    }

    if (operation.type === "gmail_summary") {
      if (providerConfig.id !== "gmail") {
        return NextResponse.json({ ok: false, error: "unsupported_provider_operation" }, { status: 400 });
      }

      const maxResults = Math.max(
        1,
        Math.min(Number(operation.max_results) || GMAIL_SUMMARY_LIMIT, GMAIL_SUMMARY_LIMIT)
      );
      const unreadOnly = operation.unread_only !== false;
      const rawQuery = typeof operation.query === "string" ? operation.query.trim() : "";
      const query = [unreadOnly ? "is:unread" : "", rawQuery].filter(Boolean).join(" ");

      const result = await executeTool(composio, entityId, connectedAccountId, GMAIL_FETCH_EMAILS_TOOL, {
        max_results: maxResults,
        ...(query ? { query } : {}),
      });
      const messages = normalizeGmailMessages(result, maxResults);

      return cappedJson({
        ok: true,
        provider: providerConfig.id,
        connected_account_id: connectedAccountId || null,
        message_count: messages.length,
        messages,
        source: "composio",
      });
    }

    return NextResponse.json({ ok: false, error: "unsupported_operation" }, { status: 400 });
  } catch {
    return NextResponse.json({ ok: false, error: "composio_call_failed" }, { status: 502 });
  }
}
