import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import {
  internalMutation,
  internalQuery,
  type MutationCtx,
} from "../_generated/server";
import {
  deleteProject,
  insertProject,
  projectImageIds,
  replaceProject,
  toProjectView,
} from "../models/projectStore";

// Internal functions for the MCP tools. Only the /mcp route calls them, after
// it checks the bearer token. They are not part of the public API.

async function assertImagesExist(ctx: MutationCtx, ids: Id<"_storage">[]) {
  for (const id of ids) {
    if (!(await ctx.db.system.get(id))) {
      throw new Error(`Image ${id} does not exist. Upload it first.`);
    }
  }
}

function assertTitle(title: string) {
  if (title.trim().length === 0) {
    throw new Error("title must not be empty.");
  }
}

export const listProjects = internalQuery({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").order("desc").take(1000);
    return projects.map((project) => ({
      id: project._id,
      title: project.title,
      description: project.description,
      url: project.url || null,
      githubUrl: project.githubUrl ?? null,
      showOnLandingPage: project.showOnLandingPage ?? true,
      imageIds: projectImageIds(project),
      createdAt: new Date(project._creationTime).toISOString(),
    }));
  },
});

export const getProject = internalQuery({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    if (!project) {
      return null;
    }
    const view = await toProjectView(ctx, project);
    return {
      id: view._id,
      title: view.title,
      description: view.description,
      url: view.url || null,
      githubUrl: view.githubUrl ?? null,
      showOnLandingPage: view.showOnLandingPage ?? true,
      images: view.images,
      createdAt: new Date(view._creationTime).toISOString(),
    };
  },
});

export const createProject = internalMutation({
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
    assertTitle(args.title);
    await assertImagesExist(ctx, args.imageIds ?? []);
    return insertProject(ctx, { ...args, title: args.title.trim() });
  },
});

export const updateProject = internalMutation({
  args: {
    id: v.id("projects"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    url: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    showOnLandingPage: v.optional(v.boolean()),
    imageIds: v.optional(v.array(v.id("_storage"))),
    addImageIds: v.optional(v.array(v.id("_storage"))),
  },
  returns: v.array(v.id("_storage")),
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Project not found.");
    }
    if (args.title !== undefined) {
      assertTitle(args.title);
    }

    const baseImageIds = args.imageIds ?? projectImageIds(existing);
    const addImageIds = args.addImageIds ?? [];
    const imageIds = [
      ...baseImageIds,
      ...addImageIds.filter((id) => !baseImageIds.includes(id)),
    ];
    await assertImagesExist(ctx, imageIds);

    await replaceProject(ctx, args.id, {
      title: args.title?.trim() ?? existing.title,
      description: args.description ?? existing.description,
      url: args.url ?? existing.url,
      githubUrl: args.githubUrl ?? existing.githubUrl,
      showOnLandingPage: args.showOnLandingPage ?? existing.showOnLandingPage,
      imageIds,
    });
    return imageIds;
  },
});

export const setVisibility = internalMutation({
  args: { id: v.id("projects"), showOnLandingPage: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (!(await ctx.db.get(args.id))) {
      throw new Error("Project not found.");
    }
    await ctx.db.patch(args.id, { showOnLandingPage: args.showOnLandingPage });
    return null;
  },
});

export const removeProject = internalMutation({
  args: { id: v.id("projects") },
  returns: v.boolean(),
  handler: (ctx, args) => deleteProject(ctx, args.id),
});

export const generateUploadUrl = internalMutation({
  args: {},
  returns: v.string(),
  handler: (ctx) => ctx.storage.generateUploadUrl(),
});

/** Removes images that the server stored for a tool call that then failed. */
export const deleteImages = internalMutation({
  args: { ids: v.array(v.id("_storage")) },
  returns: v.null(),
  handler: async (ctx, args) => {
    await Promise.all(args.ids.map((id) => ctx.storage.delete(id)));
    return null;
  },
});
