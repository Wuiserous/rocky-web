import { NextResponse } from "next/server";
import { getComposio, hasComposioConfig } from "../../../../lib/composio";
import { getRockyProviderConfig } from "../../../../lib/rocky-connections";

const MAX_RESPONSE_BYTES = 256000;
const TOOL_LIST_LIMIT = 80;
const SCHEMA_PROPERTY_LIMIT = 40;

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
  if (!tool) {
    return null;
  }
  const input = tool.inputParameters || tool.input_parameters || tool.inputSchema || tool.input_schema || null;
  const output = tool.outputParameters || tool.output_parameters || tool.outputSchema || tool.output_schema || null;
  return {
    slug: tool.slug,
    name: tool.name,
    description: tool.description,
    toolkit: tool.toolkit?.slug || tool.toolkitSlug || tool.toolkit,
    version: tool.version,
    tags: Array.isArray(tool.tags) ? tool.tags : [],
    scopes: Array.isArray(tool.scopes) ? tool.scopes : [],
    input_schema: summarizeSchema(input),
    output_schema: summarizeSchema(output),
  };
}

function summarizeSchema(schema) {
  if (!schema || typeof schema !== "object") {
    return null;
  }

  const properties = schema.properties || schema.schema?.properties || schema.json_schema?.properties || {};
  const required = Array.isArray(schema.required)
    ? schema.required
    : Array.isArray(schema.schema?.required)
      ? schema.schema.required
      : Array.isArray(schema.json_schema?.required)
        ? schema.json_schema.required
        : [];

  return {
    type: schema.type || schema.schema?.type || schema.json_schema?.type || "object",
    required,
    properties: Object.fromEntries(
      Object.entries(properties)
        .slice(0, SCHEMA_PROPERTY_LIMIT)
        .map(([key, value]) => [
          key,
          {
            type: value?.type || (Array.isArray(value?.anyOf) ? "anyOf" : undefined),
            description: value?.description || value?.title || "",
            enum: Array.isArray(value?.enum) ? value.enum.slice(0, 20) : undefined,
            items: value?.items?.type ? { type: value.items.type } : undefined,
          },
        ])
    ),
  };
}

function sanitizedError(error) {
  return {
    name: error?.name || null,
    message: error?.message || String(error || "Unknown error"),
    cause_name: error?.cause?.name || null,
    cause_message: error?.cause?.message || null,
    status: error?.status || error?.cause?.status || null,
  };
}

async function createProviderSession(composio, providerConfig, entityId, connectedAccountId) {
  const sessionConfig = {
    toolkits: [providerConfig.toolkit],
    authConfigs: {
      [providerConfig.toolkit]: providerConfig.authConfigId,
    },
    manageConnections: false,
  };

  if (connectedAccountId) {
    sessionConfig.connectedAccounts = {
      [providerConfig.toolkit]: connectedAccountId,
    };
  }

  return composio.create(entityId, sessionConfig);
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
      const requestedLimit = Number.parseInt(operation.limit, 10);
      const limit = Number.isInteger(requestedLimit)
        ? Math.max(1, Math.min(requestedLimit, TOOL_LIST_LIMIT))
        : TOOL_LIST_LIMIT;
      const search = typeof operation.search_query === "string" ? operation.search_query.trim() : "";
      const session = await createProviderSession(composio, providerConfig, entityId, connectedAccountId);

      if (search) {
        const searchResult = await session.search({
          query: search,
          toolkits: [providerConfig.toolkit],
        });
        const schemaEntries = Object.entries(searchResult?.toolSchemas || {}).slice(0, limit);
        const tools = schemaEntries.map(([slug, schema]) => ({
          slug,
          name: schema?.name || slug,
          description: schema?.description || "",
          toolkit: providerConfig.toolkit,
          inputParameters: schema?.inputSchema || schema?.inputParameters || schema?.input_parameters || schema?.parameters || null,
          outputParameters: schema?.outputSchema || schema?.outputParameters || schema?.output_parameters || null,
        }));

        return cappedJson({
          ok: searchResult?.success !== false,
          mode: "composio_tool_router",
          provider: providerConfig.id,
          search_query: search,
          session_id: session.sessionId,
          assistive_prompt: session.experimental?.assistivePrompt || null,
          connection_statuses: searchResult?.toolkitConnectionStatuses || [],
          next_steps_guidance: searchResult?.nextStepsGuidance || [],
          search_error: searchResult?.error || null,
          results: searchResult?.results || [],
          tools: tools.map(compactTool),
        });
      }

      const sessionTools = await session.tools();
      const items = Array.isArray(sessionTools?.items)
        ? sessionTools.items
        : Array.isArray(sessionTools)
          ? sessionTools
          : Object.entries(sessionTools || {}).map(([slug, tool]) => ({
              slug,
              name: tool?.name || slug,
              description: tool?.description || "",
              inputParameters: tool?.parameters || tool?.inputParameters || null,
              outputParameters: tool?.outputParameters || null,
            }));

      return cappedJson({
        ok: true,
        mode: "composio_tool_router",
        provider: providerConfig.id,
        search_query: search,
        session_id: session.sessionId,
        assistive_prompt: session.experimental?.assistivePrompt || null,
        connection_statuses: [],
        next_steps_guidance: [],
        results: [],
        tools: items.map(compactTool),
      });
    }

    if (operation.type === "tool_inspect") {
      if (!operation.tool_slug || typeof operation.tool_slug !== "string") {
        return NextResponse.json({ ok: false, error: "missing_tool_slug" }, { status: 400 });
      }

      const session = await createProviderSession(composio, providerConfig, entityId, connectedAccountId);
      const searchResult = await session.search({
        query: operation.tool_slug,
        toolkits: [providerConfig.toolkit],
      });
      const schema = searchResult?.toolSchemas?.[operation.tool_slug] || null;
      const tool = schema
        ? {
            slug: operation.tool_slug,
            name: schema.name || operation.tool_slug,
            description: schema.description || "",
            toolkit: providerConfig.toolkit,
            inputParameters: schema.inputSchema || schema.inputParameters || schema.input_parameters || schema.parameters || null,
            outputParameters: schema.outputSchema || schema.outputParameters || schema.output_parameters || null,
          }
        : null;

      return cappedJson({
        ok: true,
        mode: "composio_tool_router",
        provider: providerConfig.id,
        session_id: session.sessionId,
        assistive_prompt: session.experimental?.assistivePrompt || null,
        connection_statuses: searchResult?.toolkitConnectionStatuses || [],
        next_steps_guidance: searchResult?.nextStepsGuidance || [],
        results: searchResult?.results || [],
        tool: compactTool(tool),
      });
    }

    if (operation.type === "tool_execute") {
      if (!operation.tool_slug || typeof operation.tool_slug !== "string") {
        return NextResponse.json({ ok: false, error: "missing_tool_slug" }, { status: 400 });
      }

      const session = await createProviderSession(composio, providerConfig, entityId, connectedAccountId);
      const result = await session.execute(operation.tool_slug, operation.arguments || {});
      const successful = result?.successful !== false && !result?.error;

      return cappedJson({
        ok: successful,
        mode: "composio_tool_router",
        provider: providerConfig.id,
        tool_slug: operation.tool_slug,
        session_id: session.sessionId,
        assistive_prompt: session.experimental?.assistivePrompt || null,
        connection_statuses: [],
        next_steps_guidance: [],
        results: [],
        tools: [],
        result,
      });
    }

    return NextResponse.json({ ok: false, error: "unsupported_operation" }, { status: 400 });
  } catch (error) {
    console.error("Composio tool call failed", {
      provider: providerConfig.id,
      operationType: operation?.type,
      toolSlug: operation?.tool_slug,
      ...sanitizedError(error),
    });
    return NextResponse.json(
      {
        ok: false,
        error: "composio_call_failed",
        provider: providerConfig.id,
        operation_type: operation?.type || null,
        tool_slug: operation?.tool_slug || null,
        details: sanitizedError(error),
      },
      { status: 502 }
    );
  }
}
