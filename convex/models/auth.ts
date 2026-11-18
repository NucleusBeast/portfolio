import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";

async function isAdminEmail(ctx: QueryCtx | MutationCtx, email: string) {
  const admin = await ctx.db
    .query("admins")
    .withIndex("email", (q) => q.eq("email", email))
    .unique();

  return admin !== null;
}

async function getCurrentUserEmail(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);

  if (!userId) {
    return null;
  }

  const user = await ctx.db.get(userId);

  return user?.email ?? null;
}

export async function currentUserIsAdmin(ctx: QueryCtx | MutationCtx) {
  const email = await getCurrentUserEmail(ctx);

  return email !== null && (await isAdminEmail(ctx, email));
}

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const email = await getCurrentUserEmail(ctx);

  if (!email) {
    throw new Error("Unauthorized");
  }

  if (!(await isAdminEmail(ctx, email))) {
    throw new Error("Forbidden");
  }

  return { email };
}
