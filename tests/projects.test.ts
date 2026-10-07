/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../convex/_generated/api";
import schema from "../convex/schema";

const modules = import.meta.glob("../convex/**/*.ts");

async function setup() {
  const t = convexTest(schema, modules);
  await t.run((ctx) => ctx.db.insert("admins", { email: "admin@example.com" }));
  return { t, admin: t.withIdentity({ email: "admin@example.com" }) };
}

test("landing visibility defaults to visible for legacy and new projects, and toggles without losing details", async () => {
  const { t, admin } = await setup();
  const legacyId = await t.run((ctx) =>
    ctx.db.insert("projects", { title: "Legacy", description: "Original" }),
  );
  const visibleId = await admin.mutation(api.models.projects.create, {
    title: "Visible",
    description: "",
  });
  const hiddenId = await admin.mutation(api.models.projects.create, {
    title: "Hidden",
    description: "",
    showOnLandingPage: false,
  });
  expect(
    (await t.query(api.models.projects.list, { landingOnly: true })).map(
      (p) => p._id,
    ),
  ).toEqual(expect.arrayContaining([legacyId, visibleId]));
  expect(
    await t.query(api.models.projects.list, { landingOnly: true }),
  ).toHaveLength(2);
  expect(await t.query(api.models.projects.list, {})).toHaveLength(3);
  await admin.mutation(api.models.projects.setVisibility, {
    id: legacyId,
    showOnLandingPage: false,
  });
  expect(
    await t.query(api.models.projects.list, { landingOnly: true }),
  ).toHaveLength(1);
  expect(
    await t.query(api.models.projects.getById, { id: legacyId }),
  ).toMatchObject({ title: "Legacy", description: "Original" });
  await admin.mutation(api.models.projects.update, {
    id: hiddenId,
    title: "Updated",
    description: "New details",
  });
  expect(
    await t.query(api.models.projects.list, { landingOnly: true }),
  ).toHaveLength(1);
  await admin.mutation(api.models.projects.setVisibility, {
    id: hiddenId,
    showOnLandingPage: true,
  });
  expect(
    await t.query(api.models.projects.list, { landingOnly: true }),
  ).toHaveLength(2);
});

test("only admins can change project visibility", async () => {
  const { t, admin } = await setup();
  const id = await admin.mutation(api.models.projects.create, {
    title: "Example",
    description: "",
  });
  await expect(
    t.mutation(api.models.projects.setVisibility, {
      id,
      showOnLandingPage: false,
    }),
  ).rejects.toThrow("Unauthorized");
  await expect(
    t
      .withIdentity({ email: "other@example.com" })
      .mutation(api.models.projects.setVisibility, {
        id,
        showOnLandingPage: false,
      }),
  ).rejects.toThrow("Forbidden");
});

test("reordering preserves storage files and ordered image pairs; removing deletes only the removed file", async () => {
  const { t, admin } = await setup();
  const [first, second, third] = await t.run(async (ctx) =>
    Promise.all([
      ctx.storage.store(new Blob(["first"])),
      ctx.storage.store(new Blob(["second"])),
      ctx.storage.store(new Blob(["third"])),
    ]),
  );
  const id = await admin.mutation(api.models.projects.create, {
    title: "Gallery",
    description: "",
    imageIds: [first, second, third],
  });
  await admin.mutation(api.models.projects.update, {
    id,
    title: "Gallery",
    description: "",
    imageIds: [third, first, second],
  });
  const project = await t.query(api.models.projects.getById, { id });
  expect(project?.imageIds).toEqual([third, first, second]);
  expect(project?.images.map((image) => image.imageId)).toEqual([
    third,
    first,
    second,
  ]);
  expect(project?.imageUrls).toHaveLength(3);
  await admin.mutation(api.models.projects.update, {
    id,
    title: "Gallery",
    description: "",
    imageIds: [third, first],
  });
  expect(await t.run((ctx) => ctx.storage.getUrl(second))).toBeNull();
  expect(await t.run((ctx) => ctx.storage.getUrl(first))).not.toBeNull();
  expect(await t.run((ctx) => ctx.storage.getUrl(third))).not.toBeNull();
});

test("legacy single-image projects can add a new cover and retain the original image", async () => {
  const { t, admin } = await setup();
  const { id, oldImage, newImage } = await t.run(async (ctx) => {
    const oldImage = await ctx.storage.store(new Blob(["old"]));
    const newImage = await ctx.storage.store(new Blob(["new"]));
    const id = await ctx.db.insert("projects", {
      title: "Legacy",
      description: "",
      imageId: oldImage,
    });
    return { id, oldImage, newImage };
  });
  expect(
    (await t.query(api.models.projects.getById, { id }))?.imageIds,
  ).toEqual([oldImage]);
  await admin.mutation(api.models.projects.update, {
    id,
    title: "Legacy",
    description: "",
    imageIds: [newImage, oldImage],
  });
  expect(
    (await t.query(api.models.projects.getById, { id }))?.imageIds,
  ).toEqual([newImage, oldImage]);
  expect(await t.run((ctx) => ctx.storage.getUrl(oldImage))).not.toBeNull();
});
