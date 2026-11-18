import { MINUTE, RateLimiter } from "@convex-dev/rate-limiter";
import { v } from "convex/values";
import { components, internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import {
  action,
  internalMutation,
  mutation,
  query,
} from "../_generated/server";
import { requireAdmin } from "../models/auth";

// Personal access tokens for the MCP endpoint (/mcp).
// The database keeps only a SHA-256 hash. The raw token is shown one time.

const TOKEN_PREFIX = "pmcp_";
const LAST_USED_WRITE_INTERVAL = MINUTE;

const limiter = new RateLimiter(components.rateLimiter, {
  mcpRequest: { kind: "token bucket", rate: 120, period: MINUTE, capacity: 40 },
});

export async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const base64 = btoa(String.fromCharCode(...bytes));
  return (
    TOKEN_PREFIX +
    base64.replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "")
  );
}

const tokenSummary = v.object({
  _id: v.id("mcpTokens"),
  _creationTime: v.number(),
  name: v.string(),
  prefix: v.string(),
  createdBy: v.string(),
  lastUsedAt: v.optional(v.number()),
});

export const list = query({
  args: {},
  returns: v.array(tokenSummary),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const tokens = await ctx.db.query("mcpTokens").order("desc").take(100);
    return tokens.map(({ tokenHash: _hash, ...token }) => token);
  },
});

// An action, because mutations are deterministic and must not make secrets.
export const create = action({
  args: { name: v.string() },
  returns: v.object({ token: v.string(), id: v.id("mcpTokens") }),
  handler: async (
    ctx,
    args,
  ): Promise<{ token: string; id: Id<"mcpTokens"> }> => {
    const name = args.name.trim();
    if (name.length < 1 || name.length > 60) {
      throw new Error("Token name must be 1 to 60 characters.");
    }
    const token = randomToken();
    const id = await ctx.runMutation(internal.mcp.tokens.insert, {
      name,
      tokenHash: await sha256Hex(token),
      prefix: token.slice(0, TOKEN_PREFIX.length + 6),
    });
    return { token, id };
  },
});

export const insert = internalMutation({
  args: { name: v.string(), tokenHash: v.string(), prefix: v.string() },
  returns: v.id("mcpTokens"),
  handler: async (ctx, args) => {
    // The admin identity of the calling action carries over to this mutation.
    const { email } = await requireAdmin(ctx);
    return ctx.db.insert("mcpTokens", { ...args, createdBy: email });
  },
});

export const revoke = mutation({
  args: { id: v.id("mcpTokens") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (await ctx.db.get(args.id)) {
      await ctx.db.delete(args.id);
    }
    return null;
  },
});

/** Checks a token hash and applies the rate limit. Used by the /mcp route. */
export const authenticate = internalMutation({
  args: { tokenHash: v.string() },
  returns: v.union(
    v.object({ status: v.literal("ok"), tokenId: v.id("mcpTokens") }),
    v.object({ status: v.literal("invalid") }),
    v.object({ status: v.literal("rate_limited"), retryAfter: v.number() }),
  ),
  handler: async (ctx, args) => {
    const token = await ctx.db
      .query("mcpTokens")
      .withIndex("by_tokenHash", (q) => q.eq("tokenHash", args.tokenHash))
      .unique();
    if (!token) {
      return { status: "invalid" as const };
    }

    const limit = await limiter.limit(ctx, "mcpRequest", { key: token._id });
    if (!limit.ok) {
      return { status: "rate_limited" as const, retryAfter: limit.retryAfter };
    }

    const now = Date.now();
    if (
      token.lastUsedAt === undefined ||
      now - token.lastUsedAt > LAST_USED_WRITE_INTERVAL
    ) {
      await ctx.db.patch(token._id, { lastUsedAt: now });
    }
    return { status: "ok" as const, tokenId: token._id };
  },
});
