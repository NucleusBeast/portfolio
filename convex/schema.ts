import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const schema = defineSchema({
    projects: defineTable({
        title: v.string(),
        description: v.string(),
        url: v.string(),
    }),
});