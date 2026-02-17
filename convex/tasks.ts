import {mutation, query} from "./_generated/server";
import {v} from "convex/values";

export const get = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("tasks").collect();
    },
});

// Create a new task with the given text
export const createTask = mutation({
    args: { text: v.string(), isCompleted: v.boolean() },
    handler: async (ctx, args) => {
        const newTaskId = await ctx.db.insert("tasks", { text: args.text, isCompleted: args.isCompleted });
        return newTaskId;
    },
});