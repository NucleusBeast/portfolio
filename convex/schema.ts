import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.optional(v.string()),
    isAdmin: v.optional(v.boolean()),
    // other "users" fields...
  }).index("email", ["email"]),
  projects: defineTable({
    title: v.string(),
    description: v.string(),
    url: v.string(),
    githubUrl: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    imageIds: v.optional(v.array(v.id("_storage"))),
  }),
  skills: defineTable({
    name: v.string(),
    level: v.number(),
    category: v.string(),
  }),
  categories: defineTable({
    name: v.string(),
    color: v.string(),
    icon: v.string(),
    order: v.number(),
  }),
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
  }),
  admins: defineTable({
    email: v.string(),
  }).index("email", ["email"]),
});
