import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
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
    email: v.optional(v.string()),
    isAdmin: v.optional(v.boolean()),
    // other "users" fields...
  }).index("email", ["email"]),
  projects: defineTable({
    title: v.string(),
    description: v.string(),
    url: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    imageIds: v.optional(v.array(v.id("_storage"))),
  }),
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
  admins: defineTable({
    email: v.string(),
  }).index("email", ["email"]),
});
