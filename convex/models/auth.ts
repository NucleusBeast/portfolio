import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  const email = identity?.email;

  if (!email) {
    throw new Error("Unauthorized");
  }

  const admin = await ctx.db
    .query("admins")
    .withIndex("email", (q) => q.eq("email", email))
    .unique();

  if (!admin) {
    throw new Error("Forbidden");
  }

  return { email };
}
