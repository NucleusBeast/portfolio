import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireAdmin } from "./auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").order("desc").collect();

    return Promise.all(
      projects.map(async (project) => {
        const imageIds =
          project.imageIds ?? (project.imageId ? [project.imageId] : []);
        const imageUrls = await Promise.all(
          imageIds.map(async (imageId) => ({
            imageId,
            imageUrl: await ctx.storage.getUrl(imageId),
          })),
        );

        return {
          ...project,
          imageUrls: imageUrls
            .map((item) => item.imageUrl)
            .filter((imageUrl): imageUrl is string => imageUrl !== null),
          imageIds,
        };
      }),
    );
  },
});

export const getById = query({
  args: {
    id: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    if (!project) {
      return null;
    }

    const imageIds =
      project.imageIds ?? (project.imageId ? [project.imageId] : []);
    const imageUrls = await Promise.all(
      imageIds.map(async (imageId) => ({
        imageId,
        imageUrl: await ctx.storage.getUrl(imageId),
      })),
    );

    return {
      ...project,
      imageUrls: imageUrls
        .map((item) => item.imageUrl)
        .filter((imageUrl): imageUrl is string => imageUrl !== null),
      imageIds,
    };
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    url: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    imageIds: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    return ctx.db.insert("projects", {
      title: args.title,
      description: args.description,
      url: args.url ?? "",
      githubUrl: args.githubUrl,
      imageIds: args.imageIds ?? [],
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("projects"),
    title: v.string(),
    description: v.string(),
    url: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    imageIds: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const existingProject = await ctx.db.get(args.id);
    if (!existingProject) {
      throw new Error("Project not found");
    }

    const existingImageIds =
      existingProject.imageIds ??
      (existingProject.imageId ? [existingProject.imageId] : []);
    const nextImageIds = args.imageIds ?? [];

    const removedImageIds = existingImageIds.filter(
      (imageId) => !nextImageIds.includes(imageId),
    );

    await Promise.all(
      removedImageIds.map((imageId) => ctx.storage.delete(imageId)),
    );

    await ctx.db.patch(args.id, {
      title: args.title,
      description: args.description,
      url: args.url ?? "",
      githubUrl: args.githubUrl,
      imageIds: nextImageIds,
    });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    return ctx.storage.generateUploadUrl();
  },
});

export const remove = mutation({
  args: {
    id: v.id("projects"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const project = await ctx.db.get(args.id);
    if (!project) {
      return;
    }

    const imageIds =
      project.imageIds ?? (project.imageId ? [project.imageId] : []);

    await Promise.all(imageIds.map((imageId) => ctx.storage.delete(imageId)));

    await ctx.db.delete(args.id);
  },
});
