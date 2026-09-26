import { TableAggregate } from "@convex-dev/aggregate";
import { MINUTE, RateLimiter } from "@convex-dev/rate-limiter";
import { v } from "convex/values";
import { components } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import { mutation, query } from "../_generated/server";
import { requireAdmin } from "./auth";

const views = new TableAggregate<{
  Namespace: string;
  Key: number;
  DataModel: DataModel;
  TableName: "analyticsEvents";
}>(components.pageViews, {
  namespace: (d) => d.resource,
  sortKey: (d) => d.timestamp,
});
const visitors = new TableAggregate<{
  Namespace: string;
  Key: number;
  DataModel: DataModel;
  TableName: "analyticsSessions";
}>(components.visitors, {
  namespace: (d) => d.resource,
  sortKey: (d) => d.lastSeen,
});
const limiter = new RateLimiter(components.rateLimiter, {
  session: { kind: "token bucket", rate: 30, period: MINUTE, capacity: 10 },
  global: { kind: "token bucket", rate: 600, period: MINUTE, capacity: 100 },
});
const DAY = 86_400_000;
const formatValidator = v.union(
  v.literal("pdf"),
  v.literal("word"),
  v.literal("pages"),
);
export const record = mutation({
  args: {
    sessionId: v.string(),
    eventId: v.string(),
    kind: v.union(v.literal("page"), v.literal("cv")),
    projectId: v.optional(v.id("projects")),
    format: v.optional(formatValidator),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const uuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuid.test(args.sessionId) || !uuid.test(args.eventId)) return null;
    const identity = await ctx.auth.getUserIdentity();
    const email = identity?.email;
    if (
      email &&
      (await ctx.db
        .query("admins")
        .withIndex("email", (q) => q.eq("email", email))
        .unique())
    )
      return null;
    let resources: string[];
    if (args.kind === "cv") {
      if (!args.format || args.projectId) return null;
      const cv = await ctx.db
        .query("cvs")
        .withIndex("by_key", (q) => q.eq("key", "current"))
        .unique();
      const storage =
        args.format === "word"
          ? cv?.wordStorageId
          : args.format === "pages"
            ? cv?.pagesStorageId
            : cv?.storageId;
      if (!storage) return null;
      resources = [`cv:${args.format}`];
    } else {
      if (args.format) return null;
      if (args.projectId && !(await ctx.db.get(args.projectId))) return null;
      resources = args.projectId
        ? ["site", `project:${args.projectId}`]
        : ["site"];
    }
    if (
      !(await limiter.limit(ctx, "session", { key: args.sessionId })).ok ||
      !(await limiter.limit(ctx, "global")).ok
    )
      return null;
    const now = Date.now();
    for (const resource of resources) {
      const old = await ctx.db
        .query("analyticsSessions")
        .withIndex("by_sessionId_and_resource", (q) =>
          q.eq("sessionId", args.sessionId).eq("resource", resource),
        )
        .unique();
      if (old?.lastEventId === args.eventId) continue;
      const eventId = await ctx.db.insert("analyticsEvents", {
        resource,
        timestamp: now,
      });
      const event = await ctx.db.get(eventId);
      if (!event) throw new Error("Analytics event was not created.");
      await views.insert(ctx, event);
      if (old) {
        await ctx.db.patch(old._id, {
          lastSeen: now,
          lastEventId: args.eventId,
        });
        await visitors.replace(ctx, old, {
          ...old,
          lastSeen: now,
          lastEventId: args.eventId,
        });
      } else {
        const id = await ctx.db.insert("analyticsSessions", {
          sessionId: args.sessionId,
          resource,
          lastSeen: now,
          lastEventId: args.eventId,
        });
        const session = await ctx.db.get(id);
        if (!session) throw new Error("Analytics session was not created.");
        await visitors.insert(ctx, session);
      }
    }
    return null;
  },
});
export const summary = query({
  args: {
    days: v.union(v.literal(7), v.literal(30), v.literal(90)),
    today: v.number(),
  },
  returns: v.object({
    since: v.number(),
    views: v.number(),
    visitors: v.number(),
    downloads: v.number(),
    projects: v.array(
      v.object({
        id: v.id("projects"),
        title: v.string(),
        views: v.number(),
        visitors: v.number(),
      }),
    ),
    formats: v.array(
      v.object({ format: formatValidator, downloads: v.number() }),
    ),
    daily: v.array(v.object({ date: v.string(), views: v.number() })),
  }),
  handler: async (ctx, { days, today }) => {
    await requireAdmin(ctx);
    if (!Number.isSafeInteger(today) || today % DAY !== 0)
      throw new Error("Invalid UTC day.");
    const since = today - (days - 1) * DAY;
    const bounds = { lower: { key: since, inclusive: true } };
    const projects = await ctx.db.query("projects").take(200);
    const [totalViews, totalVisitors, projectStats, formats, daily] =
      await Promise.all([
        views.count(ctx, { namespace: "site", bounds }),
        visitors.count(ctx, { namespace: "site", bounds }),
        Promise.all(
          projects.map(async (p) => ({
            id: p._id,
            title: p.title,
            views: await views.count(ctx, {
              namespace: `project:${p._id}`,
              bounds,
            }),
            visitors: await visitors.count(ctx, {
              namespace: `project:${p._id}`,
              bounds,
            }),
          })),
        ),
        Promise.all(
          (["pdf", "word", "pages"] as const).map(async (format) => ({
            format,
            downloads: await views.count(ctx, {
              namespace: `cv:${format}`,
              bounds,
            }),
          })),
        ),
        Promise.all(
          Array.from({ length: days }, async (_, i) => {
            const start = since + i * DAY;
            return {
              date: new Date(start).toISOString().slice(0, 10),
              views: await views.count(ctx, {
                namespace: "site",
                bounds: {
                  lower: { key: start, inclusive: true },
                  upper: { key: start + DAY, inclusive: false },
                },
              }),
            };
          }),
        ),
      ]);
    return {
      since,
      views: totalViews,
      visitors: totalVisitors,
      downloads: formats.reduce((sum, f) => sum + f.downloads, 0),
      projects: projectStats.sort((a, b) => b.views - a.views),
      formats,
      daily,
    };
  },
});
