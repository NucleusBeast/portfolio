import type { TestConvex } from "convex-test";
import type schema from "../convex/schema";

// Convex Auth identifies users by a "userId|sessionId" subject.
export async function asUser(t: TestConvex<typeof schema>, email: string) {
  const userId = await t.run((ctx) => ctx.db.insert("users", { email }));
  return t.withIdentity({ subject: `${userId}|test-session` });
}
