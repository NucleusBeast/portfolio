/// <reference types="vite/client" />

import rateLimiter from "@convex-dev/rate-limiter/test";
import { convexTest } from "convex-test";
import { afterEach, expect, test, vi } from "vitest";
import { api } from "../convex/_generated/api";
import { mcpTools } from "../convex/mcp/toolDefs";
import schema from "../convex/schema";
import { asUser } from "./auth-helpers";

const modules = import.meta.glob("../convex/**/*.ts");

async function setup() {
  const t = convexTest(schema, modules);
  rateLimiter.register(t, "rateLimiter");
  await t.run((ctx) => ctx.db.insert("admins", { email: "admin@example.com" }));
  const admin = await asUser(t, "admin@example.com");
  const { token, id } = await admin.action(api.mcp.tokens.create, {
    name: "laptop",
  });

  let nextId = 1;
  const post = (body: unknown, auth = `Bearer ${token}`) =>
    t.fetch("/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: auth },
      body: JSON.stringify(body),
    });
  const rpc = async (method: string, params?: unknown) => {
    const response = await post({
      jsonrpc: "2.0",
      id: nextId++,
      method,
      params,
    });
    expect(response.status).toBe(200);
    return response.json();
  };
  const call = async (name: string, args: Record<string, unknown> = {}) => {
    const { result } = await rpc("tools/call", { name, arguments: args });
    const text: string = result.content[0].text;
    return result.isError
      ? { error: text }
      : { data: JSON.parse(text), error: undefined };
  };
  return { t, admin, token, tokenId: id, post, rpc, call };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

test("rejects requests without a valid token", async () => {
  const { post } = await setup();
  const body = { jsonrpc: "2.0", id: 1, method: "ping" };

  const missing = await post(body, "");
  expect(missing.status).toBe(401);
  expect(missing.headers.get("WWW-Authenticate")).toContain("Bearer");
  expect((await post(body, "Bearer pmcp_wrong")).status).toBe(401);
});

test("only admins can create tokens, and the list never exposes the hash", async () => {
  const { t, admin, token } = await setup();
  const stranger = await asUser(t, "someone@example.com");
  await expect(
    stranger.action(api.mcp.tokens.create, { name: "x" }),
  ).rejects.toThrow("Forbidden");
  await expect(stranger.query(api.mcp.tokens.list, {})).rejects.toThrow();

  const tokens = await admin.query(api.mcp.tokens.list, {});
  expect(tokens).toHaveLength(1);
  expect(tokens[0]).not.toHaveProperty("tokenHash");
  expect(token.startsWith(tokens[0].prefix)).toBe(true);
  expect(JSON.stringify(tokens)).not.toContain(token);
});

test("speaks the MCP handshake and lists tools without docs-only fields", async () => {
  const { rpc, post } = await setup();

  const init = await rpc("initialize", {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "test", version: "1" },
  });
  expect(init.result.protocolVersion).toBe("2025-06-18");
  expect(init.result.capabilities.tools).toBeDefined();
  expect(init.result.serverInfo.name).toBe("portfolio");

  const unknownVersion = await rpc("initialize", {
    protocolVersion: "1999-01-01",
  });
  expect(unknownVersion.result.protocolVersion).toBe("2025-11-25");

  const notification = await post({
    jsonrpc: "2.0",
    method: "notifications/initialized",
  });
  expect(notification.status).toBe(202);

  const { result } = await rpc("tools/list");
  expect(result.tools.map((tool: { name: string }) => tool.name)).toEqual(
    mcpTools.map((tool) => tool.name),
  );
  expect(result.tools[0]).not.toHaveProperty("examplePrompt");

  expect((await rpc("nope")).error.code).toBe(-32601);
  expect(
    (await rpc("tools/call", { name: "nope", arguments: {} })).error.code,
  ).toBe(-32602);
});

test("creates, updates, hides, and deletes a project through tools", async () => {
  const { t, call } = await setup();

  const created = await call("create_project", {
    title: "  Chess engine ",
    description: "Plays chess.",
    github_url: "https://github.com/example/chess",
  });
  expect(created.error).toBeUndefined();
  const id = created.data.id;

  const updated = await call("update_project", {
    id,
    description: "Plays UCI chess.",
  });
  expect(updated.error).toBeUndefined();

  const project = (await call("get_project", { id })).data;
  expect(project).toMatchObject({
    title: "Chess engine",
    description: "Plays UCI chess.",
    githubUrl: "https://github.com/example/chess",
    showOnLandingPage: true,
  });

  await call("set_project_visibility", { id, show_on_landing_page: false });
  expect(
    await t.query(api.models.projects.list, { landingOnly: true }),
  ).toHaveLength(0);

  expect((await call("delete_project", { id })).error).toMatch(/confirm/);
  expect((await call("delete_project", { id, confirm: true })).data).toEqual({
    id,
    deleted: true,
  });
  expect((await call("list_projects")).data).toEqual([]);
});

test("returns tool errors for bad arguments", async () => {
  const { call } = await setup();

  expect((await call("create_project", { title: "x" })).error).toMatch(
    /description is required/,
  );
  expect(
    (
      await call("create_project", {
        title: "x",
        description: "",
        colour: "red",
      })
    ).error,
  ).toMatch(/Unknown argument/);
  expect(
    (await call("create_project", { title: "   ", description: "" })).error,
  ).toMatch(/title/);
  expect((await call("get_project", { id: "not-an-id" })).error).toBeDefined();
});

test("attaches uploaded images and images from URLs, and deletes replaced ones", async () => {
  const { t, call } = await setup();

  const upload = await call("get_image_upload_url");
  expect(upload.data.uploadUrl).toEqual(expect.any(String));

  const uploadedId = await t.run((ctx) =>
    ctx.storage.store(new Blob(["png"], { type: "image/png" })),
  );
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(new Blob(["jpg"], { type: "image/jpeg" }), {
          headers: { "Content-Type": "image/jpeg" },
        }),
    ),
  );

  const created = await call("create_project", {
    title: "Gallery",
    description: "",
    image_ids: [uploadedId],
    image_urls: ["https://example.com/shot.jpg"],
  });
  expect(created.error).toBeUndefined();
  expect(created.data.imageIds).toHaveLength(2);
  expect(created.data.imageIds[0]).toBe(uploadedId);

  const { id } = created.data;
  await call("update_project", { id, image_ids: [uploadedId] });
  const project = (await call("get_project", { id })).data;
  expect(project.images).toHaveLength(1);
  expect(
    await t.run((ctx) => ctx.db.system.get(created.data.imageIds[1])),
  ).toBeNull();
});

test("rejects non-image URLs and cleans up after a failed call", async () => {
  const { t, call } = await setup();
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response("<html>", { headers: { "Content-Type": "text/html" } }),
    ),
  );

  const result = await call("create_project", {
    title: "Bad",
    description: "",
    image_urls: ["https://example.com/page"],
  });
  expect(result.error).toMatch(/Not an image/);
  expect(
    await t.run((ctx) => ctx.db.system.query("_storage").collect()),
  ).toEqual([]);
});

test("a revoked token stops working", async () => {
  const { admin, tokenId, post } = await setup();
  await admin.mutation(api.mcp.tokens.revoke, { id: tokenId });
  expect((await post({ jsonrpc: "2.0", id: 1, method: "ping" })).status).toBe(
    401,
  );
});
