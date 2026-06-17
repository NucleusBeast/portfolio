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
      wordUrl: cv.wordStorageId
        ? await ctx.storage.getUrl(cv.wordStorageId)
        : null,
      pagesUrl: cv.pagesStorageId
        ? await ctx.storage.getUrl(cv.pagesStorageId)
        : null,
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

export const saveWord = mutation({
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

    if (!existingCv) {
      throw new Error("Upload a current CV before adding a Word CV.");
    }

    if (existingCv.wordStorageId) {
      await ctx.storage.delete(existingCv.wordStorageId);
    }

    await ctx.db.patch(existingCv._id, {
      wordFileName: args.fileName,
      wordFileSize: args.fileSize,
      wordStorageId: args.storageId,
      wordUploadedAt: Date.now(),
    });
    return existingCv._id;
  },
});

export const savePages = mutation({
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

    if (!existingCv) {
      throw new Error("Upload a current CV before adding a Pages CV.");
    }

    if (existingCv.pagesStorageId) {
      await ctx.storage.delete(existingCv.pagesStorageId);
    }

    await ctx.db.patch(existingCv._id, {
      pagesFileName: args.fileName,
      pagesFileSize: args.fileSize,
      pagesStorageId: args.storageId,
      pagesUploadedAt: Date.now(),
    });
    return existingCv._id;
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
    if (cv.wordStorageId) {
      await ctx.storage.delete(cv.wordStorageId);
    }
    if (cv.pagesStorageId) {
      await ctx.storage.delete(cv.pagesStorageId);
    }
    await ctx.db.delete(cv._id);
  },
});

export const removeWord = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const cv = await ctx.db
      .query("cvs")
      .withIndex("by_key", (q) => q.eq("key", CV_KEY))
      .first();

    if (!cv?.wordStorageId) {
      return;
    }

    await ctx.storage.delete(cv.wordStorageId);
    await ctx.db.patch(cv._id, {
      wordFileName: undefined,
      wordFileSize: undefined,
      wordStorageId: undefined,
      wordUploadedAt: undefined,
    });
  },
});

export const removePages = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const cv = await ctx.db
      .query("cvs")
      .withIndex("by_key", (q) => q.eq("key", CV_KEY))
      .first();

    if (!cv?.pagesStorageId) {
      return;
    }

    await ctx.storage.delete(cv.pagesStorageId);
    await ctx.db.patch(cv._id, {
      pagesFileName: undefined,
      pagesFileSize: undefined,
      pagesStorageId: undefined,
      pagesUploadedAt: undefined,
    });
  },
});
