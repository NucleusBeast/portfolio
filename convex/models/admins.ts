import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("admins").collect();
  },
});

export const isAdminByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("admins")
      .withIndex("email", (q) => q.eq("email", args.email))
      .unique();

    return admin !== null;
  },
});
