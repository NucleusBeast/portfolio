"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { Check, Copy, KeyRound, Trash2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { TuiBox } from "@/components/tui-box";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { type McpToolDef, mcpTools } from "@/convex/mcp/toolDefs";

const SERVER_NAME = "portfolio";
const TOKEN_PLACEHOLDER = "<YOUR_TOKEN>";
// Claude Code expands ${VAR} in .mcp.json when it loads the file.
const ENV_TOKEN_REF = "$" + "{PORTFOLIO_MCP_TOKEN}";

function mcpEndpoint() {
  const siteUrl =
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL ??
    process.env.NEXT_PUBLIC_CONVEX_URL?.replace(
      /\.convex\.cloud\/?$/,
      ".convex.site",
    );
  return siteUrl
    ? `${siteUrl.replace(/\/$/, "")}/mcp`
    : "https://<deployment>.convex.site/mcp";
}

function formatTime(ms?: number) {
  return ms === undefined
    ? "never"
    : new Date(ms).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
}

// ── Small building blocks ───────────────────────────────────────────────────

function CopyButton({
  text,
  label = "copy",
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="tui-text-btn inline-flex items-center gap-1 text-xs"
      onClick={() =>
        void navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        })
      }
      aria-label={`Copy ${label}`}
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {copied ? "copied" : label}
    </button>
  );
}

function Code({ children, copy = true }: { children: string; copy?: boolean }) {
  return (
    <div className="relative">
      <pre className="overflow-x-auto border border-[var(--tui-border)] bg-[var(--tui-panel-2)] p-3 pr-20 text-xs leading-relaxed">
        <code>{children}</code>
      </pre>
      {copy ? (
        <div className="absolute top-2 right-2">
          <CopyButton text={children} />
        </div>
      ) : null}
    </div>
  );
}

function Diagram({ children, label }: { children: string; label: string }) {
  return (
    <pre
      role="img"
      aria-label={label}
      className="overflow-x-auto text-xs leading-snug text-[var(--tui-fg)]"
    >
      {children}
    </pre>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="space-y-2">
      <p className="font-semibold">
        <span className="tui-hash">{n}.</span> {title}
      </p>
      <div className="space-y-2 text-sm">{children}</div>
    </li>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function McpAdminPage() {
  const endpoint = mcpEndpoint();
  const [newToken, setNewToken] = useState<string | null>(null);
  const token = newToken ?? TOKEN_PLACEHOLDER;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h2 className="text-xl font-semibold">Claude connector (MCP)</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Connect Claude to your portfolio. Then you can tell Claude what to do
          in plain words, for example{" "}
          <em>
            “add this repo as a new project and use the screenshot in ./docs”
          </em>
          . Claude calls the tools below. The tools change the same data as this
          admin panel.
        </p>
      </div>

      <TuiBox as="section" title="how it works" meta="overview">
        <div className="space-y-4 text-sm">
          <Diagram label="Claude sends JSON-RPC requests with a bearer token to the /mcp endpoint on Convex, which checks the token and runs internal project functions.">
            {`┌──────────────┐  POST /mcp  (JSON-RPC)         ┌──────────────────────────────┐
│ Claude Code  │  Authorization: Bearer pmcp_…  │ Convex  (*.convex.site)      │
│              │ ─────────────────────────────► │  1. hash token, look it up   │
│ "add project │                                │  2. rate limit (120 / min)   │
│  Foo …"      │ ◄───────────────────────────── │  3. run tool                 │
└──────────────┘  tool result (JSON text)       │       │                      │
                                                │       ▼                      │
                                                │  projects table + _storage   │
                                                └──────────────────────────────┘`}
          </Diagram>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              Endpoint: <code className="text-[var(--tui-fg)]">{endpoint}</code>{" "}
              <CopyButton text={endpoint} label="url" />
            </li>
            <li>
              Transport: MCP <em>Streamable HTTP</em>, stateless, JSON
              responses. No sessions and no server-sent events.
            </li>
            <li>
              Auth: a personal access token in the <code>Authorization</code>{" "}
              header. The server keeps only a SHA-256 hash of each token.
            </li>
            <li>
              Code: <code>convex/mcp/server.ts</code> (protocol),{" "}
              <code>convex/mcp/tools.ts</code> (data),{" "}
              <code>convex/mcp/toolDefs.ts</code> (tool list, also used by this
              page).
            </li>
          </ul>
        </div>
      </TuiBox>

      <TokenPanel onCreated={setNewToken} newToken={newToken} />

      <TuiBox as="section" title="connect" meta="claude code">
        <ol className="space-y-6">
          <Step n={1} title="Create a token">
            <p className="text-muted-foreground">
              Use the token panel above.{" "}
              {newToken
                ? "Your new token is already in the commands below."
                : "When you create a token, the commands below show it."}
            </p>
          </Step>
          <Step n={2} title="Add the server to Claude Code">
            <p className="text-muted-foreground">
              Run this in a terminal. <code>--scope user</code> makes the server
              available in all your projects.
            </p>
            <Code>{`claude mcp add --transport http --scope user ${SERVER_NAME} ${endpoint} \\
  --header "Authorization: Bearer ${token}"`}</Code>
            <p className="text-muted-foreground">
              Or, to share the config in a repo without the secret, put this in{" "}
              <code>.mcp.json</code> and set <code>PORTFOLIO_MCP_TOKEN</code> in
              your shell:
            </p>
            <Code>
              {JSON.stringify(
                {
                  mcpServers: {
                    [SERVER_NAME]: {
                      type: "http",
                      url: endpoint,
                      headers: {
                        Authorization: `Bearer ${ENV_TOKEN_REF}`,
                      },
                    },
                  },
                },
                null,
                2,
              )}
            </Code>
          </Step>
          <Step n={3} title="Check the connection">
            <p className="text-muted-foreground">
              Start <code>claude</code> and type <code>/mcp</code>. The server{" "}
              <code>{SERVER_NAME}</code> must show{" "}
              <span className="tui-ok">connected</span> with {mcpTools.length}{" "}
              tools. Or test it from a terminal:
            </p>
            <Code>{`curl -s -X POST ${endpoint} \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`}</Code>
          </Step>
          <Step n={4} title="Ask Claude">
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              {mcpTools.slice(0, 5).map((tool) => (
                <li key={tool.name}>“{tool.examplePrompt}”</li>
              ))}
            </ul>
          </Step>
        </ol>
        <p className="mt-6 text-sm text-muted-foreground">
          <span className="tui-hash">note:</span> claude.ai custom connectors
          need OAuth, and this server uses a fixed token. Use Claude Code (CLI,
          desktop, or IDE) to connect.
        </p>
      </TuiBox>

      <TuiBox as="section" title="images" meta="upload flow">
        <div className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            Claude can attach images in two ways. You do not have to give these
            steps to Claude. The server tells Claude how to do it.
          </p>
          <Diagram label="Local files: get an upload URL, POST the file with curl, then pass the storage ID. Web images: pass the URL and the server downloads it.">
            {`local file                                    image on the web
──────────                                    ────────────────
get_image_upload_url ─► { uploadUrl }         create_project / update_project
        │                                       image_urls: ["https://…/shot.png"]
        ▼                                             │
curl -X POST --data-binary @shot.png uploadUrl        ▼
        │                                     server downloads it (image/*, ≤ 10 MB)
        ▼                                     and stores it in Convex storage
{ "storageId": "kg2…" }
        │
        ▼
create_project  image_ids: ["kg2…"]`}
          </Diagram>
          <p className="text-muted-foreground">
            In <code>update_project</code>, <code>image_ids</code> replaces the
            full list and deletes images that are not in it.{" "}
            <code>add_image_ids</code> and <code>add_image_urls</code> only
            append.
          </p>
        </div>
      </TuiBox>

      <TuiBox as="section" title="tools" meta={`${mcpTools.length} tools`}>
        <div className="space-y-6">
          {mcpTools.map((tool) => (
            <ToolDoc key={tool.name} tool={tool} />
          ))}
        </div>
      </TuiBox>

      <TuiBox as="section" title="security" meta="read this">
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            A token has full admin access to projects. Treat it like a password.
            Do not commit it.
          </li>
          <li>
            Make one token for each device, so you can revoke one without the
            others.
          </li>
          <li>
            If a token leaks, revoke it above. It stops working immediately.
          </li>
          <li>
            Each token has a limit of 120 requests per minute (burst 40). Extra
            requests get HTTP 429.
          </li>
          <li>
            <code>delete_project</code> needs <code>confirm: true</code>, and
            Claude Code asks you before it runs a tool that changes data, unless
            you allow it.
          </li>
        </ul>
      </TuiBox>

      <TuiBox as="section" title="troubleshooting" meta="errors">
        <dl className="space-y-3 text-sm">
          {[
            [
              "401 Unauthorized",
              "The token is wrong, revoked, or missing “Bearer ”. Make a new token and add the server again.",
            ],
            [
              "429 Too many requests",
              "You hit the rate limit. Wait for the time in the Retry-After header.",
            ],
            [
              "405 Method Not Allowed",
              "The server accepts only POST. Use --transport http, not sse.",
            ],
            [
              "Tool error: Image … does not exist",
              "The storageId is wrong, or the upload failed. Upload the file again.",
            ],
            [
              "Tool error: Not an image",
              "The URL returns a web page, not an image. Use the direct image URL.",
            ],
            [
              "Server not in /mcp list",
              "Run claude mcp list. If you added it with project scope, start claude in that folder.",
            ],
          ].map(([term, detail]) => (
            <div key={term}>
              <dt className="font-semibold text-[var(--tui-red)]">{term}</dt>
              <dd className="text-muted-foreground">{detail}</dd>
            </div>
          ))}
        </dl>
      </TuiBox>
    </div>
  );
}

// ── Tokens ──────────────────────────────────────────────────────────────────

function TokenPanel({
  newToken,
  onCreated,
}: {
  newToken: string | null;
  onCreated: (token: string) => void;
}) {
  const tokens = useQuery(api.mcp.tokens.list);
  const createToken = useAction(api.mcp.tokens.create);
  const revokeToken = useMutation(api.mcp.tokens.revoke);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const revoke = async (id: Id<"mcpTokens">, tokenName: string) => {
    if (
      !window.confirm(
        `Revoke "${tokenName}"? Clients that use it stop working.`,
      )
    )
      return;
    await revokeToken({ id });
  };

  return (
    <TuiBox
      as="section"
      title="tokens"
      meta={tokens ? `${tokens.length} active` : "…"}
    >
      <div className="space-y-5">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError("");
            try {
              const result = await createToken({ name });
              onCreated(result.token);
              setName("");
            } catch {
              setError(
                "Could not create the token. Use a name of 1 to 60 characters.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="min-w-56 flex-1 space-y-2">
            <Label htmlFor="token-name">Token name</Label>
            <Input
              id="token-name"
              placeholder="for example: laptop"
              maxLength={60}
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <Button type="submit" disabled={busy}>
            <KeyRound className="size-4" />
            {busy ? "Creating…" : "Create token"}
          </Button>
        </form>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {newToken ? (
          <output className="block space-y-2 border border-[var(--tui-green)] p-3">
            <p className="text-sm">
              <span className="tui-ok">✓ token created.</span> Copy it now. You
              cannot see it again.
            </p>
            <Code>{newToken}</Code>
          </output>
        ) : null}

        {tokens === undefined ? (
          <p className="text-sm text-muted-foreground">Loading tokens…</p>
        ) : tokens.length === 0 ? (
          <p className="tui-comment text-sm"># no tokens yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4 font-normal">name</th>
                  <th className="py-2 pr-4 font-normal">token</th>
                  <th className="py-2 pr-4 font-normal">created</th>
                  <th className="py-2 pr-4 font-normal">last used</th>
                  <th className="py-2 font-normal">
                    <span className="sr-only">actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((item) => (
                  <tr
                    key={item._id}
                    className="border-t border-[var(--tui-border)]"
                  >
                    <td className="py-2 pr-4">{item.name}</td>
                    <td className="py-2 pr-4 font-mono text-muted-foreground">
                      {item.prefix}…
                    </td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      {formatTime(item._creationTime)}
                    </td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      {formatTime(item.lastUsedAt)}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        className="tui-text-btn inline-flex items-center gap-1 text-[var(--tui-red)]"
                        onClick={() => void revoke(item._id, item.name)}
                      >
                        <Trash2 className="size-3" /> revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </TuiBox>
  );
}

// ── Tool reference ──────────────────────────────────────────────────────────

function schemaType(schema: Record<string, unknown>) {
  if (schema.type === "array") {
    const items = schema.items as Record<string, unknown> | undefined;
    return `${String(items?.type ?? "any")}[]`;
  }
  return "const" in schema ? JSON.stringify(schema.const) : String(schema.type);
}

function ToolDoc({ tool }: { tool: McpToolDef }) {
  const params = Object.entries(tool.inputSchema.properties);
  const required = tool.inputSchema.required ?? [];
  const { readOnlyHint, destructiveHint } = tool.annotations;

  return (
    <article className="space-y-2 border-t border-[var(--tui-border)] pt-4 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="font-mono font-semibold text-[var(--tui-accent)]">
          {tool.name}
        </h3>
        <span className="text-xs">
          {readOnlyHint ? (
            <span className="tui-ok">[read-only]</span>
          ) : destructiveHint ? (
            <span className="text-[var(--tui-red)]">[can delete data]</span>
          ) : (
            <span className="tui-muted">[writes]</span>
          )}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{tool.description}</p>
      {params.length > 0 ? (
        <ul className="space-y-1 text-xs">
          {params.map(([param, schema]) => (
            <li key={param} className="flex flex-wrap gap-x-2">
              <code className="text-[var(--tui-fg)]">{param}</code>
              <span className="tui-muted">{schemaType(schema)}</span>
              {required.includes(param) ? (
                <span className="text-[var(--tui-accent-2)]">required</span>
              ) : null}
              {typeof schema.description === "string" ? (
                <span className="text-muted-foreground">
                  — {schema.description}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="tui-comment text-xs"># no arguments</p>
      )}
      <p className="text-xs">
        <span className="tui-muted">try:</span> “{tool.examplePrompt}”
      </p>
    </article>
  );
}
