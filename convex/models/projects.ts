import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireAdmin } from "./auth";

const projectValidator = v.object({
  _id: v.id("projects"),
  _creationTime: v.number(),
  title: v.string(),
  description: v.string(),
  url: v.optional(v.string()),
  githubUrl: v.optional(v.string()),
  imageId: v.optional(v.id("_storage")),
  imageIds: v.array(v.id("_storage")),
  imageUrls: v.array(v.string()),
  images: v.array(
    v.object({
      imageId: v.id("_storage"),
      imageUrl: v.union(v.string(), v.null()),
    }),
  ),
  showOnLandingPage: v.optional(v.boolean()),
});

export const list = query({
  args: { landingOnly: v.optional(v.boolean()) },
  returns: v.array(projectValidator),
  handler: async (ctx, args) => {
    const projects = args.landingOnly
      ? (
          await Promise.all(
            [true, undefined].map((visible) =>
              ctx.db
                .query("projects")
                .withIndex("by_showOnLandingPage", (q) =>
                  q.eq("showOnLandingPage", visible),
                )
                .order("desc")
                .take(1000),
            ),
          )
        )
          .flat()
          .sort((a, b) => b._creationTime - a._creationTime)
          .slice(0, 1000)
      : await ctx.db.query("projects").order("desc").take(1000);

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
          images: imageUrls,
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
  returns: v.union(projectValidator, v.null()),
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
      images: imageUrls,
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
    showOnLandingPage: v.optional(v.boolean()),
  },
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    return ctx.db.insert("projects", {
      title: args.title,
      description: args.description,
      url: args.url ?? "",
      githubUrl: args.githubUrl,
      imageIds: args.imageIds ?? [],
      showOnLandingPage: args.showOnLandingPage ?? true,
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
    showOnLandingPage: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const existingProject = await ctx.db.get(args.id);
    if (!existingProject) {
      throw new Error("Project not found");
    }

    const existingImageIds =
      existingProject.imageIds ??
      (existingProject.imageId ? [existingProject.imageId] : []);
    const nextImageIds = args.imageIds ?? existingImageIds;

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
      showOnLandingPage:
        args.showOnLandingPage ?? existingProject.showOnLandingPage ?? true,
    });
    return null;
  },
});

export const setVisibility = mutation({
  args: { id: v.id("projects"), showOnLandingPage: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (!(await ctx.db.get(args.id))) throw new Error("Project not found");
    await ctx.db.patch(args.id, { showOnLandingPage: args.showOnLandingPage });
    return null;
  },
});

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireAdmin(ctx);

    return ctx.storage.generateUploadUrl();
  },
});

export const remove = mutation({
  args: {
    id: v.id("projects"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const project = await ctx.db.get(args.id);
    if (!project) {
      return null;
    }

    const imageIds =
      project.imageIds ?? (project.imageId ? [project.imageId] : []);

    await Promise.all(imageIds.map((imageId) => ctx.storage.delete(imageId)));

    await ctx.db.delete(args.id);
    return null;
  },
});
