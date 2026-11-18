/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as http from "../http.js";
import type * as mcp_server from "../mcp/server.js";
import type * as mcp_tokens from "../mcp/tokens.js";
import type * as mcp_toolDefs from "../mcp/toolDefs.js";
import type * as mcp_tools from "../mcp/tools.js";
import type * as models_admins from "../models/admins.js";
import type * as models_analytics from "../models/analytics.js";
import type * as models_auth from "../models/auth.js";
import type * as models_cv from "../models/cv.js";
import type * as models_projectStore from "../models/projectStore.js";
import type * as models_projects from "../models/projects.js";
import type * as models_siteContent from "../models/siteContent.js";
import type * as models_skills from "../models/skills.js";
import type * as models_tasks from "../models/tasks.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  http: typeof http;
  "mcp/server": typeof mcp_server;
  "mcp/tokens": typeof mcp_tokens;
  "mcp/toolDefs": typeof mcp_toolDefs;
  "mcp/tools": typeof mcp_tools;
  "models/admins": typeof models_admins;
  "models/analytics": typeof models_analytics;
  "models/auth": typeof models_auth;
  "models/cv": typeof models_cv;
  "models/projectStore": typeof models_projectStore;
  "models/projects": typeof models_projects;
  "models/siteContent": typeof models_siteContent;
  "models/skills": typeof models_skills;
  "models/tasks": typeof models_tasks;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  pageViews: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"pageViews">;
  visitors: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"visitors">;
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
};
