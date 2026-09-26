/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as http from "../http.js";
import type * as models_admins from "../models/admins.js";
import type * as models_analytics from "../models/analytics.js";
import type * as models_auth from "../models/auth.js";
import type * as models_cv from "../models/cv.js";
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
  http: typeof http;
  "models/admins": typeof models_admins;
  "models/analytics": typeof models_analytics;
  "models/auth": typeof models_auth;
  "models/cv": typeof models_cv;
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
  pageViews: {
    btree: {
      aggregateBetween: FunctionReference<
        "query",
        "internal",
        { k1?: any; k2?: any; namespace?: any; stale?: boolean },
        { count: number; sum: number }
      >;
      aggregateBetweenBatch: FunctionReference<
        "query",
        "internal",
        {
          queries: Array<{ k1?: any; k2?: any; namespace?: any }>;
          stale?: boolean;
        },
        Array<{ count: number; sum: number }>
      >;
      atNegativeOffset: FunctionReference<
        "query",
        "internal",
        {
          k1?: any;
          k2?: any;
          namespace?: any;
          offset: number;
          stale?: boolean;
        },
        { k: any; s: number; v: any }
      >;
      atOffset: FunctionReference<
        "query",
        "internal",
        {
          k1?: any;
          k2?: any;
          namespace?: any;
          offset: number;
          stale?: boolean;
        },
        { k: any; s: number; v: any }
      >;
      atOffsetBatch: FunctionReference<
        "query",
        "internal",
        {
          queries: Array<{
            k1?: any;
            k2?: any;
            namespace?: any;
            offset: number;
          }>;
          stale?: boolean;
        },
        Array<{ k: any; s: number; v: any }>
      >;
      get: FunctionReference<
        "query",
        "internal",
        { key: any; namespace?: any; stale?: boolean },
        null | { k: any; s: number; v: any }
      >;
      offset: FunctionReference<
        "query",
        "internal",
        { k1?: any; key: any; namespace?: any; stale?: boolean },
        number
      >;
      offsetUntil: FunctionReference<
        "query",
        "internal",
        { k2?: any; key: any; namespace?: any; stale?: boolean },
        number
      >;
      paginate: FunctionReference<
        "query",
        "internal",
        {
          cursor?: string;
          k1?: any;
          k2?: any;
          limit: number;
          namespace?: any;
          order: "asc" | "desc";
          stale?: boolean;
        },
        {
          cursor: string;
          isDone: boolean;
          page: Array<{ k: any; s: number; v: any }>;
        }
      >;
      paginateNamespaces: FunctionReference<
        "query",
        "internal",
        { cursor?: string; limit: number; stale?: boolean },
        { cursor: string; isDone: boolean; page: Array<any> }
      >;
      validate: FunctionReference<
        "query",
        "internal",
        { namespace?: any; stale?: boolean },
        any
      >;
    };
    deadLetter: {
      delete_: FunctionReference<
        "mutation",
        "internal",
        { id: string },
        boolean
      >;
      get: FunctionReference<
        "query",
        "internal",
        { id: string },
        {
          _creationTime: number;
          _id: string;
          commitTs: bigint;
          error: string;
          operation:
            | {
                key: any;
                namespace?: any;
                summand?: number;
                type: "insert";
                value: any;
              }
            | { key: any; namespace?: any; type: "delete" }
            | {
                currentKey: any;
                namespace?: any;
                newKey: any;
                newNamespace?: any;
                summand?: number;
                type: "replace";
                value: any;
              }
            | { key: any; namespace?: any; type: "deleteIfExists" }
            | {
                currentKey: any;
                namespace?: any;
                newKey: any;
                newNamespace?: any;
                summand?: number;
                type: "replaceOrInsert";
                value: any;
              };
        } | null
      >;
      list: FunctionReference<
        "query",
        "internal",
        {
          order?: "asc" | "desc";
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            _creationTime: number;
            _id: string;
            commitTs: bigint;
            error: string;
            operation:
              | {
                  key: any;
                  namespace?: any;
                  summand?: number;
                  type: "insert";
                  value: any;
                }
              | { key: any; namespace?: any; type: "delete" }
              | {
                  currentKey: any;
                  namespace?: any;
                  newKey: any;
                  newNamespace?: any;
                  summand?: number;
                  type: "replace";
                  value: any;
                }
              | { key: any; namespace?: any; type: "deleteIfExists" }
              | {
                  currentKey: any;
                  namespace?: any;
                  newKey: any;
                  newNamespace?: any;
                  summand?: number;
                  type: "replaceOrInsert";
                  value: any;
                };
          }>;
          pageStatus?: "SplitRecommended" | "SplitRequired" | null;
          splitCursor?: string | null;
        }
      >;
    };
    inspect: {
      display: FunctionReference<"query", "internal", { namespace?: any }, any>;
      dump: FunctionReference<"query", "internal", { namespace?: any }, string>;
      inspectNode: FunctionReference<
        "query",
        "internal",
        { namespace?: any; node?: string },
        null
      >;
      listTreeNodes: FunctionReference<
        "query",
        "internal",
        { take?: number },
        Array<{
          _creationTime: number;
          _id: string;
          aggregate?: { count: number; sum: number };
          items: Array<{ k: any; s: number; v: any }>;
          subtrees: Array<string>;
        }>
      >;
      listTrees: FunctionReference<
        "query",
        "internal",
        { take?: number },
        Array<{
          _creationTime: number;
          _id: string;
          maxNodeSize: number;
          namespace?: any;
          root: string;
        }>
      >;
    };
    public: {
      clear: FunctionReference<
        "mutation",
        "internal",
        { maxNodeSize?: number; namespace?: any; rootLazy?: boolean },
        null
      >;
      delete_: FunctionReference<
        "mutation",
        "internal",
        { key: any; namespace?: any },
        null
      >;
      deleteIfExists: FunctionReference<
        "mutation",
        "internal",
        { key: any; namespace?: any },
        any
      >;
      enqueue: FunctionReference<
        "mutation",
        "internal",
        {
          operation:
            | {
                key: any;
                namespace?: any;
                summand?: number;
                type: "insert";
                value: any;
              }
            | { key: any; namespace?: any; type: "delete" }
            | {
                currentKey: any;
                namespace?: any;
                newKey: any;
                newNamespace?: any;
                summand?: number;
                type: "replace";
                value: any;
              }
            | { key: any; namespace?: any; type: "deleteIfExists" }
            | {
                currentKey: any;
                namespace?: any;
                newKey: any;
                newNamespace?: any;
                summand?: number;
                type: "replaceOrInsert";
                value: any;
              };
        },
        null
      >;
      enqueueBatch: FunctionReference<
        "mutation",
        "internal",
        {
          operations: Array<
            | {
                key: any;
                namespace?: any;
                summand?: number;
                type: "insert";
                value: any;
              }
            | { key: any; namespace?: any; type: "delete" }
            | {
                currentKey: any;
                namespace?: any;
                newKey: any;
                newNamespace?: any;
                summand?: number;
                type: "replace";
                value: any;
              }
            | { key: any; namespace?: any; type: "deleteIfExists" }
            | {
                currentKey: any;
                namespace?: any;
                newKey: any;
                newNamespace?: any;
                summand?: number;
                type: "replaceOrInsert";
                value: any;
              }
          >;
        },
        null
      >;
      init: FunctionReference<
        "mutation",
        "internal",
        { maxNodeSize?: number; namespace?: any; rootLazy?: boolean },
        null
      >;
      insert: FunctionReference<
        "mutation",
        "internal",
        { key: any; namespace?: any; summand?: number; value: any },
        null
      >;
      makeRootLazy: FunctionReference<
        "mutation",
        "internal",
        { namespace?: any },
        null
      >;
      replace: FunctionReference<
        "mutation",
        "internal",
        {
          currentKey: any;
          namespace?: any;
          newKey: any;
          newNamespace?: any;
          summand?: number;
          value: any;
        },
        null
      >;
      replaceOrInsert: FunctionReference<
        "mutation",
        "internal",
        {
          currentKey: any;
          namespace?: any;
          newKey: any;
          newNamespace?: any;
          summand?: number;
          value: any;
        },
        any
      >;
    };
  };
  visitors: {
    btree: {
      aggregateBetween: FunctionReference<
        "query",
        "internal",
        { k1?: any; k2?: any; namespace?: any; stale?: boolean },
        { count: number; sum: number }
      >;
      aggregateBetweenBatch: FunctionReference<
        "query",
        "internal",
        {
          queries: Array<{ k1?: any; k2?: any; namespace?: any }>;
          stale?: boolean;
        },
        Array<{ count: number; sum: number }>
      >;
      atNegativeOffset: FunctionReference<
        "query",
        "internal",
        {
          k1?: any;
          k2?: any;
          namespace?: any;
          offset: number;
          stale?: boolean;
        },
        { k: any; s: number; v: any }
      >;
      atOffset: FunctionReference<
        "query",
        "internal",
        {
          k1?: any;
          k2?: any;
          namespace?: any;
          offset: number;
          stale?: boolean;
        },
        { k: any; s: number; v: any }
      >;
      atOffsetBatch: FunctionReference<
        "query",
        "internal",
        {
          queries: Array<{
            k1?: any;
            k2?: any;
            namespace?: any;
            offset: number;
          }>;
          stale?: boolean;
        },
        Array<{ k: any; s: number; v: any }>
      >;
      get: FunctionReference<
        "query",
        "internal",
        { key: any; namespace?: any; stale?: boolean },
        null | { k: any; s: number; v: any }
      >;
      offset: FunctionReference<
        "query",
        "internal",
        { k1?: any; key: any; namespace?: any; stale?: boolean },
        number
      >;
      offsetUntil: FunctionReference<
        "query",
        "internal",
        { k2?: any; key: any; namespace?: any; stale?: boolean },
        number
      >;
      paginate: FunctionReference<
        "query",
        "internal",
        {
          cursor?: string;
          k1?: any;
          k2?: any;
          limit: number;
          namespace?: any;
          order: "asc" | "desc";
          stale?: boolean;
        },
        {
          cursor: string;
          isDone: boolean;
          page: Array<{ k: any; s: number; v: any }>;
        }
      >;
      paginateNamespaces: FunctionReference<
        "query",
        "internal",
        { cursor?: string; limit: number; stale?: boolean },
        { cursor: string; isDone: boolean; page: Array<any> }
      >;
      validate: FunctionReference<
        "query",
        "internal",
        { namespace?: any; stale?: boolean },
        any
      >;
    };
    deadLetter: {
      delete_: FunctionReference<
        "mutation",
        "internal",
        { id: string },
        boolean
      >;
      get: FunctionReference<
        "query",
        "internal",
        { id: string },
        {
          _creationTime: number;
          _id: string;
          commitTs: bigint;
          error: string;
          operation:
            | {
                key: any;
                namespace?: any;
                summand?: number;
                type: "insert";
                value: any;
              }
            | { key: any; namespace?: any; type: "delete" }
            | {
                currentKey: any;
                namespace?: any;
                newKey: any;
                newNamespace?: any;
                summand?: number;
                type: "replace";
                value: any;
              }
            | { key: any; namespace?: any; type: "deleteIfExists" }
            | {
                currentKey: any;
                namespace?: any;
                newKey: any;
                newNamespace?: any;
                summand?: number;
                type: "replaceOrInsert";
                value: any;
              };
        } | null
      >;
      list: FunctionReference<
        "query",
        "internal",
        {
          order?: "asc" | "desc";
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            _creationTime: number;
            _id: string;
            commitTs: bigint;
            error: string;
            operation:
              | {
                  key: any;
                  namespace?: any;
                  summand?: number;
                  type: "insert";
                  value: any;
                }
              | { key: any; namespace?: any; type: "delete" }
              | {
                  currentKey: any;
                  namespace?: any;
                  newKey: any;
                  newNamespace?: any;
                  summand?: number;
                  type: "replace";
                  value: any;
                }
              | { key: any; namespace?: any; type: "deleteIfExists" }
              | {
                  currentKey: any;
                  namespace?: any;
                  newKey: any;
                  newNamespace?: any;
                  summand?: number;
                  type: "replaceOrInsert";
                  value: any;
                };
          }>;
          pageStatus?: "SplitRecommended" | "SplitRequired" | null;
          splitCursor?: string | null;
        }
      >;
    };
    inspect: {
      display: FunctionReference<"query", "internal", { namespace?: any }, any>;
      dump: FunctionReference<"query", "internal", { namespace?: any }, string>;
      inspectNode: FunctionReference<
        "query",
        "internal",
        { namespace?: any; node?: string },
        null
      >;
      listTreeNodes: FunctionReference<
        "query",
        "internal",
        { take?: number },
        Array<{
          _creationTime: number;
          _id: string;
          aggregate?: { count: number; sum: number };
          items: Array<{ k: any; s: number; v: any }>;
          subtrees: Array<string>;
        }>
      >;
      listTrees: FunctionReference<
        "query",
        "internal",
        { take?: number },
        Array<{
          _creationTime: number;
          _id: string;
          maxNodeSize: number;
          namespace?: any;
          root: string;
        }>
      >;
    };
    public: {
      clear: FunctionReference<
        "mutation",
        "internal",
        { maxNodeSize?: number; namespace?: any; rootLazy?: boolean },
        null
      >;
      delete_: FunctionReference<
        "mutation",
        "internal",
        { key: any; namespace?: any },
        null
      >;
      deleteIfExists: FunctionReference<
        "mutation",
        "internal",
        { key: any; namespace?: any },
        any
      >;
      enqueue: FunctionReference<
        "mutation",
        "internal",
        {
          operation:
            | {
                key: any;
                namespace?: any;
                summand?: number;
                type: "insert";
                value: any;
              }
            | { key: any; namespace?: any; type: "delete" }
            | {
                currentKey: any;
                namespace?: any;
                newKey: any;
                newNamespace?: any;
                summand?: number;
                type: "replace";
                value: any;
              }
            | { key: any; namespace?: any; type: "deleteIfExists" }
            | {
                currentKey: any;
                namespace?: any;
                newKey: any;
                newNamespace?: any;
                summand?: number;
                type: "replaceOrInsert";
                value: any;
              };
        },
        null
      >;
      enqueueBatch: FunctionReference<
        "mutation",
        "internal",
        {
          operations: Array<
            | {
                key: any;
                namespace?: any;
                summand?: number;
                type: "insert";
                value: any;
              }
            | { key: any; namespace?: any; type: "delete" }
            | {
                currentKey: any;
                namespace?: any;
                newKey: any;
                newNamespace?: any;
                summand?: number;
                type: "replace";
                value: any;
              }
            | { key: any; namespace?: any; type: "deleteIfExists" }
            | {
                currentKey: any;
                namespace?: any;
                newKey: any;
                newNamespace?: any;
                summand?: number;
                type: "replaceOrInsert";
                value: any;
              }
          >;
        },
        null
      >;
      init: FunctionReference<
        "mutation",
        "internal",
        { maxNodeSize?: number; namespace?: any; rootLazy?: boolean },
        null
      >;
      insert: FunctionReference<
        "mutation",
        "internal",
        { key: any; namespace?: any; summand?: number; value: any },
        null
      >;
      makeRootLazy: FunctionReference<
        "mutation",
        "internal",
        { namespace?: any },
        null
      >;
      replace: FunctionReference<
        "mutation",
        "internal",
        {
          currentKey: any;
          namespace?: any;
          newKey: any;
          newNamespace?: any;
          summand?: number;
          value: any;
        },
        null
      >;
      replaceOrInsert: FunctionReference<
        "mutation",
        "internal",
        {
          currentKey: any;
          namespace?: any;
          newKey: any;
          newNamespace?: any;
          summand?: number;
          value: any;
        },
        any
      >;
    };
  };
  rateLimiter: {
    lib: {
      checkRateLimit: FunctionReference<
        "query",
        "internal",
        {
          config:
            | {
                applyUpdates?: "transactionally" | "asynchronously";
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                applyUpdates?: "transactionally" | "asynchronously";
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          count?: number;
          key?: string;
          name: string;
          reserve?: boolean;
          throws?: boolean;
        },
        { ok: true; retryAfter?: number } | { ok: false; retryAfter: number }
      >;
      clearAll: FunctionReference<
        "mutation",
        "internal",
        { before?: number },
        null
      >;
      enqueueUpdates: FunctionReference<
        "mutation",
        "internal",
        {
          updates: Array<
            | {
                config:
                  | {
                      applyUpdates?: "transactionally" | "asynchronously";
                      capacity?: number;
                      kind: "token bucket";
                      maxReserved?: number;
                      period: number;
                      rate: number;
                      shards?: number;
                      start?: null;
                    }
                  | {
                      applyUpdates?: "transactionally" | "asynchronously";
                      capacity?: number;
                      kind: "fixed window";
                      maxReserved?: number;
                      period: number;
                      rate: number;
                      shards?: number;
                      start?: number;
                    };
                count: number;
                key?: string;
                kind: "consume";
                name: string;
                ts: number;
              }
            | { key?: string; kind: "reset"; name: string }
          >;
        },
        null
      >;
      getServerTime: FunctionReference<"mutation", "internal", {}, number>;
      getValue: FunctionReference<
        "query",
        "internal",
        {
          config:
            | {
                applyUpdates?: "transactionally" | "asynchronously";
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                applyUpdates?: "transactionally" | "asynchronously";
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          key?: string;
          name: string;
          sampleShards?: number;
        },
        {
          config:
            | {
                applyUpdates?: "transactionally" | "asynchronously";
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                applyUpdates?: "transactionally" | "asynchronously";
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          shard: number;
          ts: number;
          value: number;
        }
      >;
      rateLimit: FunctionReference<
        "mutation",
        "internal",
        {
          config:
            | {
                applyUpdates?: "transactionally" | "asynchronously";
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                applyUpdates?: "transactionally" | "asynchronously";
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          count?: number;
          key?: string;
          name: string;
          reserve?: boolean;
          throws?: boolean;
        },
        { ok: true; retryAfter?: number } | { ok: false; retryAfter: number }
      >;
      resetRateLimit: FunctionReference<
        "mutation",
        "internal",
        { key?: string; name: string },
        null
      >;
    };
    time: {
      getServerTime: FunctionReference<"mutation", "internal", {}, number>;
    };
  };
};
