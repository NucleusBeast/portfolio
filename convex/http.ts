import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { mcpMethodNotAllowed, mcpPost } from "./mcp/server";

const http = httpRouter();

auth.addHttpRoutes(http);

// MCP endpoint for Claude. Docs and tokens: /admin/mcp in the app.
http.route({ path: "/mcp", method: "POST", handler: mcpPost });
http.route({ path: "/mcp", method: "GET", handler: mcpMethodNotAllowed });
http.route({ path: "/mcp", method: "DELETE", handler: mcpMethodNotAllowed });

export default http;
