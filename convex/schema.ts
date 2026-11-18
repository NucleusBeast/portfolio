import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  siteContent: defineTable({
    key: v.string(),
    aboutEyebrow: v.string(),
    aboutHeading: v.string(),
    aboutBody: v.string(),
    contactEyebrow: v.string(),
    contactHeading: v.string(),
    contactBody: v.string(),
    contactEmail: v.string(),
    githubUrl: v.string(),
    location: v.string(),
  }).index("by_key", ["key"]),
  analyticsEvents: defineTable({
    resource: v.string(),
    timestamp: v.number(),
  }),
  analyticsSessions: defineTable({
    sessionId: v.string(),
    resource: v.string(),
    lastSeen: v.number(),
    lastEventId: v.string(),
  }).index("by_sessionId_and_resource", ["sessionId", "resource"]),
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    isAdmin: v.optional(v.boolean()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),
  projects: defineTable({
    title: v.string(),
    description: v.string(),
    url: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    imageIds: v.optional(v.array(v.id("_storage"))),
    showOnLandingPage: v.optional(v.boolean()),
  }).index("by_showOnLandingPage", ["showOnLandingPage"]),
  cvs: defineTable({
    key: v.string(),
    fileName: v.string(),
    fileSize: v.number(),
    storageId: v.id("_storage"),
    wordFileName: v.optional(v.string()),
    wordFileSize: v.optional(v.number()),
    wordStorageId: v.optional(v.id("_storage")),
    wordUploadedAt: v.optional(v.number()),
    pagesFileName: v.optional(v.string()),
    pagesFileSize: v.optional(v.number()),
    pagesStorageId: v.optional(v.id("_storage")),
    pagesUploadedAt: v.optional(v.number()),
    uploadedAt: v.number(),
  }).index("by_key", ["key"]),
  skills: defineTable({
    name: v.string(),
    level: v.number(),
    category: v.string(),
  }),
  categories: defineTable({
    name: v.string(),
    color: v.string(),
    icon: v.string(),
    order: v.number(),
  }),
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
  }),
  mcpTokens: defineTable({
    name: v.string(),
    // SHA-256 of the token. The raw token is shown once and never stored.
    tokenHash: v.string(),
    // First characters of the token, so you can recognize it in the admin UI.
    prefix: v.string(),
    createdBy: v.string(),
    lastUsedAt: v.optional(v.number()),
  }).index("by_tokenHash", ["tokenHash"]),
  admins: defineTable({
    email: v.string(),
  }).index("email", ["email"]),
});
