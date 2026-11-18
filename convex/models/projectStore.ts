import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

// Shared project logic. The admin mutations and the MCP tools both use it.

export type ProjectInput = {
  title: string;
  description: string;
  url?: string;
  githubUrl?: string;
  imageIds?: Id<"_storage">[];
  showOnLandingPage?: boolean;
};

export function projectImageIds(project: Doc<"projects">) {
  return project.imageIds ?? (project.imageId ? [project.imageId] : []);
}

export async function toProjectView(ctx: QueryCtx, project: Doc<"projects">) {
  const imageIds = projectImageIds(project);
  const images = await Promise.all(
    imageIds.map(async (imageId) => ({
      imageId,
      imageUrl: await ctx.storage.getUrl(imageId),
    })),
  );
  return {
    ...project,
    images,
    imageUrls: images
      .map((item) => item.imageUrl)
      .filter((imageUrl): imageUrl is string => imageUrl !== null),
    imageIds,
  };
}

export function insertProject(ctx: MutationCtx, input: ProjectInput) {
  return ctx.db.insert("projects", {
    title: input.title,
    description: input.description,
    url: input.url ?? "",
    githubUrl: input.githubUrl,
    imageIds: input.imageIds ?? [],
    showOnLandingPage: input.showOnLandingPage ?? true,
  });
}

/** Replaces all project fields. Deletes stored images that are no longer used. */
export async function replaceProject(
  ctx: MutationCtx,
  id: Id<"projects">,
  input: ProjectInput,
) {
  const existing = await ctx.db.get(id);
  if (!existing) {
    throw new Error("Project not found");
  }

  const existingImageIds = projectImageIds(existing);
  const nextImageIds = input.imageIds ?? existingImageIds;
  const removedImageIds = existingImageIds.filter(
    (imageId) => !nextImageIds.includes(imageId),
  );
  await Promise.all(
    removedImageIds.map((imageId) => ctx.storage.delete(imageId)),
  );

  await ctx.db.patch(id, {
    title: input.title,
    description: input.description,
    url: input.url ?? "",
    githubUrl: input.githubUrl,
    imageIds: nextImageIds,
    showOnLandingPage:
      input.showOnLandingPage ?? existing.showOnLandingPage ?? true,
  });
}

/** Deletes the project and its stored images. Returns false if it does not exist. */
export async function deleteProject(ctx: MutationCtx, id: Id<"projects">) {
  const project = await ctx.db.get(id);
  if (!project) {
    return false;
  }
  await Promise.all(
    projectImageIds(project).map((imageId) => ctx.storage.delete(imageId)),
  );
  await ctx.db.delete(id);
  return true;
}
