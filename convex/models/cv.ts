import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireAdmin } from "./auth";

const CV_KEY = "current";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const cv = await ctx.db
      .query("cvs")
      .withIndex("by_key", (q) => q.eq("key", CV_KEY))
      .first();

    if (!cv) {
      return null;
    }

    return {
      ...cv,
      url: await ctx.storage.getUrl(cv.storageId),
    };
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    return ctx.storage.generateUploadUrl();
  },
});

export const save = mutation({
  args: {
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const existingCv = await ctx.db
      .query("cvs")
      .withIndex("by_key", (q) => q.eq("key", CV_KEY))
      .first();

    if (existingCv) {
      await ctx.storage.delete(existingCv.storageId);
      await ctx.db.patch(existingCv._id, {
        fileName: args.fileName,
        fileSize: args.fileSize,
        storageId: args.storageId,
        uploadedAt: Date.now(),
      });
      return existingCv._id;
    }

    return ctx.db.insert("cvs", {
      key: CV_KEY,
      fileName: args.fileName,
      fileSize: args.fileSize,
      storageId: args.storageId,
      uploadedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const cv = await ctx.db
      .query("cvs")
      .withIndex("by_key", (q) => q.eq("key", CV_KEY))
      .first();

    if (!cv) {
      return;
    }

    await ctx.storage.delete(cv.storageId);
    await ctx.db.delete(cv._id);
  },
});
