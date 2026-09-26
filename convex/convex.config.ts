import aggregate from "@convex-dev/aggregate/convex.config.js";
import rateLimiter from "@convex-dev/rate-limiter/convex.config.js";
import { defineApp } from "convex/server";

const app = defineApp();
app.use(aggregate, { name: "pageViews" });
app.use(aggregate, { name: "visitors" });
app.use(rateLimiter);
export default app;
