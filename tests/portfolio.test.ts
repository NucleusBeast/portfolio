/// <reference types="vite/client" />

import aggregate from "@convex-dev/aggregate/test";
import rateLimiter from "@convex-dev/rate-limiter/test";
import { convexTest } from "convex-test";
import { afterEach, describe, expect, test, vi } from "vitest";
import { api } from "../convex/_generated/api";
import schema from "../convex/schema";
import { defaultSiteContent } from "../lib/site-content";

const modules = import.meta.glob("../convex/**/*.ts");
const DAY = 86_400_000;
const today = () => Math.floor(Date.now() / DAY) * DAY;
async function setup() {
  const t = convexTest(schema, modules);
  aggregate.register(t, "pageViews");
  aggregate.register(t, "visitors");
  rateLimiter.register(t, "rateLimiter");
  const id = await t.run(async (ctx) => {
    await ctx.db.insert("admins", { email: "admin@example.com" });
    return ctx.db.insert("projects", {
      title: "Example",
      description: "A project",
    });
  });
  const admin = t.withIdentity({ email: "admin@example.com" });
  return { t, admin, id };
}
const event = () => ({
  sessionId: crypto.randomUUID(),
  eventId: crypto.randomUUID(),
  kind: "page" as const,
});
afterEach(() => vi.useRealTimers());
describe("About content", () => {
  test("public reads defaults, only admins can publish valid content", async () => {
    const { t, admin } = await setup();
    expect(await t.query(api.models.siteContent.get)).toEqual(
      defaultSiteContent,
    );
    await expect(
      t.mutation(api.models.siteContent.save, defaultSiteContent),
    ).rejects.toThrow("Unauthorized");
    await expect(
      t
        .withIdentity({ email: "other@example.com" })
        .mutation(api.models.siteContent.save, defaultSiteContent),
    ).rejects.toThrow("Forbidden");
    await expect(
      admin.mutation(api.models.siteContent.save, {
        ...defaultSiteContent,
        githubUrl: "javascript:alert(1)",
      }),
    ).rejects.toThrow();
    const updated = {
      ...defaultSiteContent,
      aboutHeading: "An updated heading",
    };
    await admin.mutation(api.models.siteContent.save, updated);
    expect(await t.query(api.models.siteContent.get)).toEqual(updated);
    await admin.mutation(api.models.siteContent.save, defaultSiteContent);
    expect(
      await t.run((ctx) => ctx.db.query("siteContent").collect()),
    ).toHaveLength(1);
  });
});
describe("Analytics", () => {
  test("private totals, duplicate events, repeat views and project visitors", async () => {
    const { t, admin, id } = await setup();
    await expect(
      t.query(api.models.analytics.summary, { days: 7, today: today() }),
    ).rejects.toThrow("Unauthorized");
    const first = event();
    await t.mutation(api.models.analytics.record, first);
    await t.mutation(api.models.analytics.record, first);
    await t.mutation(api.models.analytics.record, {
      ...first,
      eventId: crypto.randomUUID(),
      projectId: id,
    });
    await t.mutation(api.models.analytics.record, {
      ...first,
      eventId: crypto.randomUUID(),
      projectId: id,
    });
    await t.mutation(api.models.analytics.record, {
      ...event(),
      projectId: id,
    });
    await admin.mutation(api.models.analytics.record, {
      ...event(),
      projectId: id,
    });
    const stats = await admin.query(api.models.analytics.summary, {
      days: 7,
      today: today(),
    });
    expect(stats.views).toBe(4);
    expect(stats.visitors).toBe(2);
    expect(stats.projects[0]).toMatchObject({ views: 3, visitors: 2 });
    expect(stats.daily.reduce((n, d) => n + d.views, 0)).toBe(4);
  });
  test("ignores missing CVs, invalid sessions and deleted projects", async () => {
    const { t, admin, id } = await setup();
    await t.mutation(api.models.analytics.record, {
      ...event(),
      kind: "cv",
      format: "pdf",
    });
    await t.mutation(api.models.analytics.record, {
      ...event(),
      sessionId: "invalid",
    });
    await t.run((ctx) => ctx.db.delete(id));
    await t.mutation(api.models.analytics.record, {
      ...event(),
      projectId: id,
    });
    const stats = await admin.query(api.models.analytics.summary, {
      days: 30,
      today: today(),
    });
    expect(stats.views).toBe(0);
    expect(stats.downloads).toBe(0);
  });
  test("counts available CV formats separately without inflating site views", async () => {
    const { t, admin } = await setup();
    await t.run(async (ctx) => {
      const storageId = await ctx.storage.store(new Blob(["test cv"]));
      await ctx.db.insert("cvs", {
        key: "current",
        storageId,
        fileName: "cv.pdf",
        fileSize: 7,
        uploadedAt: Date.now(),
        wordStorageId: storageId,
      });
    });
    const first = { ...event(), kind: "cv" as const, format: "pdf" as const };
    await t.mutation(api.models.analytics.record, first);
    await t.mutation(api.models.analytics.record, first);
    await t.mutation(api.models.analytics.record, {
      ...first,
      eventId: crypto.randomUUID(),
      format: "word",
    });
    await t.mutation(api.models.analytics.record, {
      ...first,
      eventId: crypto.randomUUID(),
      format: "pages",
    });
    const stats = await admin.query(api.models.analytics.summary, {
      days: 7,
      today: today(),
    });
    expect(stats.downloads).toBe(2);
    expect(stats.views).toBe(0);
    expect(stats.formats.map((f) => f.downloads)).toEqual([1, 1, 0]);
  });
  test("periods exclude older views but include returning visitors", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-01T12:00:00Z"));
    const { t, admin } = await setup();
    const first = event();
    await t.mutation(api.models.analytics.record, first);
    vi.setSystemTime(new Date("2026-09-20T12:00:00Z"));
    await t.mutation(api.models.analytics.record, {
      ...first,
      eventId: crypto.randomUUID(),
    });
    expect(
      (
        await admin.query(api.models.analytics.summary, {
          days: 7,
          today: today(),
        })
      ).views,
    ).toBe(1);
    const month = await admin.query(api.models.analytics.summary, {
      days: 30,
      today: today(),
    });
    expect(month.views).toBe(2);
    expect(month.visitors).toBe(1);
  });
  test("rate limits excessive requests per session", async () => {
    const { t, admin } = await setup();
    const first = event();
    for (let i = 0; i < 15; i++)
      await t.mutation(api.models.analytics.record, {
        ...first,
        eventId: crypto.randomUUID(),
      });
    expect(
      (
        await admin.query(api.models.analytics.summary, {
          days: 7,
          today: today(),
        })
      ).views,
    ).toBe(10);
  });
});
