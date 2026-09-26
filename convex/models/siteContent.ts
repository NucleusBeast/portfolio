import { v } from "convex/values";
import { defaultSiteContent } from "../../lib/site-content";
import { mutation, query } from "../_generated/server";
import { requireAdmin } from "./auth";

export const contentFields = {
  aboutEyebrow: v.string(),
  aboutHeading: v.string(),
  aboutBody: v.string(),
  contactEyebrow: v.string(),
  contactHeading: v.string(),
  contactBody: v.string(),
  contactEmail: v.string(),
  githubUrl: v.string(),
  location: v.string(),
};
export const get = query({
  args: {},
  returns: v.object(contentFields),
  handler: async (ctx) => {
    const row = await ctx.db
      .query("siteContent")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .unique();
    if (!row) return defaultSiteContent;
    const { _id, _creationTime, key: _key, ...content } = row;
    return content;
  },
});
export const save = mutation({
  args: contentFields,
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const content = { ...args };
    for (const key of Object.keys(content) as (keyof typeof content)[]) {
      content[key] = content[key].trim();
      const limit = key.endsWith("Body") ? 6000 : 200;
      if (!content[key] || content[key].length > limit)
        throw new Error(`Please enter ${key} (maximum ${limit} characters).`);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content.contactEmail))
      throw new Error("Enter a valid contact email.");
    const url = new URL(content.githubUrl);
    if (
      url.protocol !== "https:" ||
      url.hostname !== "github.com" ||
      url.username ||
      url.password
    )
      throw new Error("Enter an HTTPS GitHub URL.");
    const row = await ctx.db
      .query("siteContent")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .unique();
    if (row) await ctx.db.patch(row._id, content);
    else await ctx.db.insert("siteContent", { key: "main", ...content });
    return null;
  },
});
