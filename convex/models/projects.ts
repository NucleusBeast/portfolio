import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireAdmin } from "./auth";
import {
  deleteProject,
  insertProject,
  replaceProject,
  toProjectView,
} from "./projectStore";

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

    return Promise.all(projects.map((project) => toProjectView(ctx, project)));
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

    return toProjectView(ctx, project);
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

    return insertProject(ctx, args);
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

    const { id, ...input } = args;
    await replaceProject(ctx, id, input);
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

    await deleteProject(ctx, args.id);
    return null;
  },
});
