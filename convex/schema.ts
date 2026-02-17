import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
    ...authTables,
    projects: defineTable({
        title: v.string(),
        description: v.string(),
        image: v.string(),
        url: v.string(),
        github_url: v.string(),
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
});