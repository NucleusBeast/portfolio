import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { type ActionCtx, httpAction } from "../_generated/server";
import { sha256Hex } from "./tokens";
import { mcpServerInstructions, mcpTools } from "./toolDefs";

// A stateless MCP server over "Streamable HTTP" (JSON responses, no SSE).
// Spec: https://modelcontextprotocol.io/specification
//
//   client ──POST /mcp {jsonrpc, method}──► check bearer token ─► rate limit
//          ◄──────────── JSON-RPC result ── dispatch method ◄───┘

const SERVER_INFO = {
  name: "portfolio",
  title: "Portfolio admin",
  version: "1.0.0",
};
const SUPPORTED_VERSIONS = [
  "2025-11-25",
  "2025-06-18",
  "2025-03-26",
  "2024-11-05",
];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const IMAGE_FETCH_TIMEOUT_MS = 15_000;

type JsonRpcId = string | number | null;
type JsonRpcMessage = {
  jsonrpc?: unknown;
  id?: JsonRpcId;
  method?: unknown;
  params?: unknown;
};
type Args = Record<string, unknown>;

class InvalidParams extends Error {}

const json = (body: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });

const rpcResult = (id: JsonRpcId, result: unknown) => ({
  jsonrpc: "2.0",
  id,
  result,
});
const rpcError = (id: JsonRpcId, code: number, message: string) => ({
  jsonrpc: "2.0",
  id,
  error: { code, message },
});

// ── Argument helpers ────────────────────────────────────────────────────────

function str(args: Args, key: string) {
  const value = args[key];
  if (value === undefined) return undefined;
  if (typeof value !== "string")
    throw new InvalidParams(`${key} must be a string.`);
  return value;
}

function bool(args: Args, key: string) {
  const value = args[key];
  if (value === undefined) return undefined;
  if (typeof value !== "boolean")
    throw new InvalidParams(`${key} must be a boolean.`);
  return value;
}

function strList(args: Args, key: string, max: number) {
  const value = args[key];
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new InvalidParams(`${key} must be an array of strings.`);
  }
  if (value.length > max)
    throw new InvalidParams(`${key} allows at most ${max} items.`);
  return value as string[];
}

function required<T>(value: T | undefined, key: string): T {
  if (value === undefined) throw new InvalidParams(`${key} is required.`);
  return value;
}

/** Drops undefined fields, so optional Convex arguments stay absent. */
function compact<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined),
  ) as T;
}

function checkKnownArgs(toolName: string, args: Args) {
  const tool = mcpTools.find((item) => item.name === toolName);
  const known = Object.keys(tool?.inputSchema.properties ?? {});
  const unknown = Object.keys(args).filter((key) => !known.includes(key));
  if (unknown.length > 0) {
    throw new InvalidParams(
      `Unknown argument(s): ${unknown.join(", ")}. Allowed: ${known.join(", ") || "none"}.`,
    );
  }
}

// ── Images from URLs ────────────────────────────────────────────────────────

async function storeImageFromUrl(ctx: ActionCtx, rawUrl: string) {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new InvalidParams(`Not a valid URL: ${rawUrl}`);
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new InvalidParams(`Only http(s) image URLs are allowed: ${rawUrl}`);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), IMAGE_FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Download failed (${response.status}): ${rawUrl}`);
    }
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) {
      throw new Error(
        `Not an image (content-type "${contentType}"): ${rawUrl}`,
      );
    }
    const blob = await response.blob();
    if (blob.size > MAX_IMAGE_BYTES) {
      throw new Error(`Image is larger than 10 MB: ${rawUrl}`);
    }
    return ctx.storage.store(blob);
  } finally {
    clearTimeout(timer);
  }
}

/** Stores images, runs `use`, and deletes the stored images if `use` fails. */
async function withImagesFromUrls<T>(
  ctx: ActionCtx,
  urls: string[] | undefined,
  use: (ids: Id<"_storage">[]) => Promise<T>,
) {
  const stored: Id<"_storage">[] = [];
  try {
    for (const url of urls ?? []) {
      stored.push(await storeImageFromUrl(ctx, url));
    }
    return await use(stored);
  } catch (error) {
    if (stored.length > 0) {
      await ctx.runMutation(internal.mcp.tools.deleteImages, { ids: stored });
    }
    throw error;
  }
}

// ── Tools ───────────────────────────────────────────────────────────────────

type ToolHandler = (ctx: ActionCtx, args: Args) => Promise<unknown>;

const projectId = (args: Args) =>
  required(str(args, "id"), "id") as Id<"projects">;
const storageIds = (args: Args, key: string) =>
  strList(args, key, 20) as Id<"_storage">[] | undefined;

const toolHandlers: Record<string, ToolHandler> = {
  list_projects: (ctx) => ctx.runQuery(internal.mcp.tools.listProjects, {}),

  get_project: async (ctx, args) => {
    const project = await ctx.runQuery(internal.mcp.tools.getProject, {
      id: projectId(args),
    });
    if (!project) throw new Error("Project not found.");
    return project;
  },

  create_project: (ctx, args) => {
    const fields = compact({
      title: required(str(args, "title"), "title"),
      description: required(str(args, "description"), "description"),
      url: str(args, "url"),
      githubUrl: str(args, "github_url"),
      showOnLandingPage: bool(args, "show_on_landing_page"),
    });
    const imageIds = storageIds(args, "image_ids") ?? [];
    return withImagesFromUrls(
      ctx,
      strList(args, "image_urls", 10),
      async (fromUrls) => {
        const id = await ctx.runMutation(internal.mcp.tools.createProject, {
          ...fields,
          imageIds: [...imageIds, ...fromUrls],
        });
        return { id, imageIds: [...imageIds, ...fromUrls] };
      },
    );
  },

  update_project: (ctx, args) => {
    const fields = compact({
      id: projectId(args),
      title: str(args, "title"),
      description: str(args, "description"),
      url: str(args, "url"),
      githubUrl: str(args, "github_url"),
      showOnLandingPage: bool(args, "show_on_landing_page"),
      imageIds: storageIds(args, "image_ids"),
    });
    const addImageIds = storageIds(args, "add_image_ids") ?? [];
    return withImagesFromUrls(
      ctx,
      strList(args, "add_image_urls", 10),
      async (fromUrls) => {
        const imageIds = await ctx.runMutation(
          internal.mcp.tools.updateProject,
          {
            ...fields,
            addImageIds: [...addImageIds, ...fromUrls],
          },
        );
        return { id: fields.id, imageIds };
      },
    );
  },

  set_project_visibility: async (ctx, args) => {
    const id = projectId(args);
    const showOnLandingPage = required(
      bool(args, "show_on_landing_page"),
      "show_on_landing_page",
    );
    await ctx.runMutation(internal.mcp.tools.setVisibility, {
      id,
      showOnLandingPage,
    });
    return { id, showOnLandingPage };
  },

  delete_project: async (ctx, args) => {
    if (bool(args, "confirm") !== true) {
      throw new InvalidParams(
        "Set confirm: true after the user agrees to delete.",
      );
    }
    const id = projectId(args);
    const deleted = await ctx.runMutation(internal.mcp.tools.removeProject, {
      id,
    });
    if (!deleted) throw new Error("Project not found.");
    return { id, deleted: true };
  },

  get_image_upload_url: async (ctx) => ({
    uploadUrl: await ctx.runMutation(internal.mcp.tools.generateUploadUrl, {}),
    howTo:
      'curl -s -X POST -H "Content-Type: <mime type>" --data-binary @<file> "<uploadUrl>"  →  {"storageId": "..."}',
  }),
};

async function callTool(ctx: ActionCtx, params: unknown) {
  const { name, arguments: rawArgs } = (params ?? {}) as {
    name?: unknown;
    arguments?: unknown;
  };
  if (typeof name !== "string" || !(name in toolHandlers)) {
    throw new InvalidParams(`Unknown tool: ${String(name)}`);
  }
  const args = (rawArgs ?? {}) as Args;
  if (typeof args !== "object" || Array.isArray(args)) {
    throw new InvalidParams("arguments must be an object.");
  }

  // Bad arguments and failed operations are tool errors (isError), so the
  // model can read the message and try again. See the MCP tools spec.
  try {
    checkKnownArgs(name, args);
    const result = await toolHandlers[name](ctx, args);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Error: ${message}` }],
      isError: true,
    };
  }
}

// ── JSON-RPC dispatch ───────────────────────────────────────────────────────

async function handleMessage(ctx: ActionCtx, message: JsonRpcMessage) {
  const isRequest =
    message.id !== undefined && typeof message.method === "string";
  if (message.jsonrpc !== "2.0" || typeof message.method !== "string") {
    // A response or a bad message. Responses from the client need no answer.
    return message.method === undefined && message.id !== undefined
      ? null
      : rpcError(message.id ?? null, -32600, "Invalid request");
  }
  if (!isRequest) {
    return null; // Notification, for example notifications/initialized.
  }
  const id = message.id as JsonRpcId;

  try {
    switch (message.method) {
      case "initialize": {
        const requested = (
          message.params as { protocolVersion?: unknown } | undefined
        )?.protocolVersion;
        const protocolVersion =
          typeof requested === "string" &&
          SUPPORTED_VERSIONS.includes(requested)
            ? requested
            : SUPPORTED_VERSIONS[0];
        return rpcResult(id, {
          protocolVersion,
          capabilities: { tools: { listChanged: false } },
          serverInfo: SERVER_INFO,
          instructions: mcpServerInstructions,
        });
      }
      case "ping":
        return rpcResult(id, {});
      case "tools/list":
        return rpcResult(id, {
          tools: mcpTools.map(({ examplePrompt: _docsOnly, ...tool }) => tool),
        });
      case "tools/call":
        return rpcResult(id, await callTool(ctx, message.params));
      default:
        return rpcError(id, -32601, `Method not found: ${message.method}`);
    }
  } catch (error) {
    if (error instanceof InvalidParams) {
      return rpcError(id, -32602, error.message);
    }
    console.error("MCP request failed", error);
    return rpcError(id, -32603, "Internal error");
  }
}

// ── HTTP ────────────────────────────────────────────────────────────────────

async function authenticate(ctx: ActionCtx, request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(\S+)$/i.exec(header);
  const unauthorized = json(
    { error: "Missing or invalid token. Create one in /admin/mcp." },
    401,
    { "WWW-Authenticate": 'Bearer realm="portfolio-mcp"' },
  );
  if (!match) return unauthorized;

  const result = await ctx.runMutation(internal.mcp.tokens.authenticate, {
    tokenHash: await sha256Hex(match[1]),
  });
  if (result.status === "invalid") return unauthorized;
  if (result.status === "rate_limited") {
    return json({ error: "Too many requests" }, 429, {
      "Retry-After": String(Math.ceil(result.retryAfter / 1000)),
    });
  }
  return null;
}

export const mcpPost = httpAction(async (ctx, request) => {
  const denied = await authenticate(ctx, request);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(rpcError(null, -32700, "Parse error"), 400);
  }

  // Older clients (protocol 2025-03-26) can send a batch array.
  if (Array.isArray(body)) {
    const replies = [];
    for (const message of body) {
      const reply = await handleMessage(ctx, message as JsonRpcMessage);
      if (reply) replies.push(reply);
    }
    return replies.length > 0
      ? json(replies)
      : new Response(null, { status: 202 });
  }
  if (typeof body !== "object" || body === null) {
    return json(rpcError(null, -32600, "Invalid request"), 400);
  }

  const reply = await handleMessage(ctx, body as JsonRpcMessage);
  return reply ? json(reply) : new Response(null, { status: 202 });
});

// No server-to-client stream (GET) and no sessions (DELETE) in this server.
export const mcpMethodNotAllowed = httpAction(
  async () =>
    new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: "POST" },
    }),
);
