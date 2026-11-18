// MCP tool definitions. This file is plain data with no Convex imports, so
// the /mcp server and the admin docs page (app/admin/mcp) both use it.

export type JsonSchema = {
  type: "object";
  properties: Record<string, Record<string, unknown>>;
  required?: string[];
  additionalProperties?: boolean;
};

export type McpToolDef = {
  name: string;
  title: string;
  description: string;
  inputSchema: JsonSchema;
  annotations: {
    readOnlyHint: boolean;
    destructiveHint: boolean;
    idempotentHint: boolean;
  };
  /** Docs only. Not sent to clients. */
  examplePrompt: string;
};

const projectFields = {
  title: { type: "string", minLength: 1, maxLength: 200 },
  description: {
    type: "string",
    maxLength: 10000,
    description: "Project description shown on the project page.",
  },
  url: {
    type: "string",
    description: "Live site URL. Use an empty string for no URL.",
  },
  github_url: { type: "string", description: "Repository URL." },
  show_on_landing_page: {
    type: "boolean",
    description: "Show the project on the landing page. Default: true.",
  },
  image_urls: {
    type: "array",
    items: { type: "string", format: "uri" },
    maxItems: 10,
    description:
      "Public http(s) image URLs. The server downloads and stores each image (max 10 MB each).",
  },
  image_ids: {
    type: "array",
    items: { type: "string" },
    maxItems: 20,
    description:
      "Storage IDs from files you uploaded with get_image_upload_url.",
  },
} as const;

const idField = {
  id: { type: "string", description: "Project ID from list_projects." },
} as const;

export const mcpTools: McpToolDef[] = [
  {
    name: "list_projects",
    title: "List projects",
    description:
      "List all portfolio projects, newest first, with their IDs, links, visibility, and image IDs.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    examplePrompt: "Which of my projects are hidden from the landing page?",
  },
  {
    name: "get_project",
    title: "Get project",
    description: "Get one project with all fields and its image URLs.",
    inputSchema: {
      type: "object",
      properties: idField,
      required: ["id"],
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    examplePrompt: "Show me the full description of my Weather app project.",
  },
  {
    name: "create_project",
    title: "Create project",
    description:
      "Create a portfolio project. Attach images with image_urls (public URLs) and/or image_ids (from get_image_upload_url). Returns the new project ID.",
    inputSchema: {
      type: "object",
      properties: projectFields,
      required: ["title", "description"],
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
    },
    examplePrompt:
      "Add a project for this repo. Write a short description from the README and use ./docs/screenshot.png as the image.",
  },
  {
    name: "update_project",
    title: "Update project",
    description:
      "Change some fields of a project. Fields you leave out stay the same. image_ids REPLACES the image list (removed images are deleted). add_image_urls and add_image_ids APPEND images.",
    inputSchema: {
      type: "object",
      properties: {
        ...idField,
        title: projectFields.title,
        description: projectFields.description,
        url: projectFields.url,
        github_url: projectFields.github_url,
        show_on_landing_page: projectFields.show_on_landing_page,
        image_ids: {
          ...projectFields.image_ids,
          description:
            "The complete new image list, in display order. Images not in the list are deleted.",
        },
        add_image_urls: projectFields.image_urls,
        add_image_ids: projectFields.image_ids,
      },
      required: ["id"],
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
    },
    examplePrompt:
      "Rewrite the description of my Chess engine project to mention the new UCI support.",
  },
  {
    name: "set_project_visibility",
    title: "Show or hide project",
    description: "Show or hide a project on the landing page.",
    inputSchema: {
      type: "object",
      properties: {
        ...idField,
        show_on_landing_page: { type: "boolean" },
      },
      required: ["id", "show_on_landing_page"],
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
    },
    examplePrompt: "Hide the Todo list project from the landing page.",
  },
  {
    name: "delete_project",
    title: "Delete project",
    description:
      "Permanently delete a project and its images. Ask the user before you call this. Requires confirm: true.",
    inputSchema: {
      type: "object",
      properties: {
        ...idField,
        confirm: {
          type: "boolean",
          const: true,
          description: "Must be true. Set it only after the user agrees.",
        },
      },
      required: ["id", "confirm"],
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
    },
    examplePrompt: "Delete the old Test project.",
  },
  {
    name: "get_image_upload_url",
    title: "Get image upload URL",
    description:
      'Get a one-time URL to upload a local image. Send the file with: curl -s -X POST -H "Content-Type: image/png" --data-binary @file.png "<upload_url>". The response is {"storageId": "..."}. Pass that ID in image_ids or add_image_ids. The URL expires after 1 hour.',
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
    },
    examplePrompt: "Upload ~/Pictures/app.png to my Weather app project.",
  },
];

export const mcpServerInstructions = [
  "Tools to manage the projects on this portfolio site.",
  "Call list_projects first to find project IDs.",
  "For a local image: call get_image_upload_url, POST the file to that URL with curl, then pass the returned storageId in image_ids or add_image_ids.",
  "For an image on the web: pass its URL in image_urls or add_image_urls.",
  "Ask the user before you delete a project or replace its images.",
].join("\n");
