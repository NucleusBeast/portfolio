import {mutation, query} from "./_generated/server";
import {v} from "convex/values";

export const get = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("skills").collect();
    },
});

// Create a new task with the given text
export const post = mutation({
    args: { name: v.string(), level: v.number(), category: v.string() },
    handler: async (ctx, args) => {
        const newSkillId = await ctx.db.insert("skills", { name: args.name, level: args.level, category: args.category });
        return newSkillId;
    },
});

export const deleteSkill = mutation({
    args: { id: v.id("skills") },
    handler: async (ctx, args) => {
        await ctx.db.delete("skills", args.id);
    },
});