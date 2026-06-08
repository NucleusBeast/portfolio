import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireAdmin } from "./auth";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("skills").collect();
  },
});

export const post = mutation({
  args: { name: v.string(), level: v.number(), category: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const newSkillId = await ctx.db.insert("skills", {
      name: args.name,
      level: args.level,
      category: args.category,
    });
    return newSkillId;
  },
});

export const updateLevel = mutation({
  args: { id: v.id("skills"), level: v.number() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const skill = await ctx.db.get(args.id);

    if (!skill) {
      throw new Error("Skill not found");
    }

    await ctx.db.patch(args.id, {
      level: Math.max(0, Math.min(10, Math.round(args.level))),
    });
  },
});

export const deleteSkill = mutation({
  args: { id: v.id("skills") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    await ctx.db.delete("skills", args.id);
  },
});
