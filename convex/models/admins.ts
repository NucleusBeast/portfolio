import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireAdmin } from "./auth";

export const get = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    return await ctx.db.query("admins").collect();
  },
});

export const isAdminByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const admin = await ctx.db
      .query("admins")
      .withIndex("email", (q) => q.eq("email", args.email))
      .unique();

    return admin !== null;
  },
});

export const currentUserIsAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const email = identity?.email;

    if (!email) {
      return false;
    }

    const admin = await ctx.db
      .query("admins")
      .withIndex("email", (q) => q.eq("email", email))
      .unique();

    return admin !== null;
  },
});
