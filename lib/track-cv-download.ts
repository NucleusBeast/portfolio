import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { after } from "next/server";
import { api } from "@/convex/_generated/api";

// Call only after storage successfully serves a CV. Analytics never blocks delivery.
export async function trackCvDownload(
  request: Request,
  format: "pdf" | "word" | "pages",
) {
  if (
    request.method !== "GET" ||
    request.headers.get("purpose") === "prefetch" ||
    request.headers.get("sec-purpose")?.includes("prefetch") ||
    request.headers.get("dnt") === "1" ||
    /bot|crawler|spider|headless/i.test(request.headers.get("user-agent") ?? "")
  )
    return;
  try {
    const { getToken } = await auth();
    const token = await getToken({ template: "convex" });
    const supplied = new URL(request.url).searchParams.get("sid") ?? "";
    const sessionId = /^[0-9a-f-]{36}$/i.test(supplied)
      ? supplied
      : crypto.randomUUID();
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) return;
    after(async () => {
      try {
        const client = new ConvexHttpClient(url);
        if (token) client.setAuth(token);
        await client.mutation(api.models.analytics.record, {
          sessionId,
          eventId: crypto.randomUUID(),
          kind: "cv",
          format,
        });
      } catch (error) {
        console.error(
          "CV analytics failed",
          error instanceof Error ? error.message : "Unknown error",
        );
      }
    });
  } catch {
    /* A telemetry failure must never prevent a download. */
  }
}
