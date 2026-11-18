import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { MutationCtx } from "./_generated/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
  callbacks: {
    // Only emails in the "admins" table can create an account.
    async createOrUpdateUser(ctx, args) {
      if (args.existingUserId) {
        return args.existingUserId;
      }

      const db = ctx.db as unknown as MutationCtx["db"];
      const email = args.profile.email;
      if (typeof email !== "string") {
        throw new ConvexError("Email is required");
      }

      const admin = await db
        .query("admins")
        .withIndex("email", (q) => q.eq("email", email))
        .unique();
      if (!admin) {
        throw new ConvexError("Sign up is not allowed for this email");
      }

      const existingUser = await db
        .query("users")
        .withIndex("email", (q) => q.eq("email", email))
        .unique();
      if (existingUser) {
        return existingUser._id;
      }

      return await db.insert("users", { email });
    },
  },
});
