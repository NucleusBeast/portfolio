import { defineConfig } from "vitest/config";
export default defineConfig({
  resolve: { alias: { "@": new URL(".", import.meta.url).pathname } },
  test: {
    include: ["tests/**/*.test.ts"],
    server: {
      deps: {
        inline: [
          "@convex-dev/aggregate",
          "@convex-dev/rate-limiter",
          "@convex-dev/batch-worker",
        ],
      },
    },
  },
});
