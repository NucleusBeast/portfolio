import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";

function contentDispositionFileName(fileName: string) {
  const fallbackName = fileName.replace(/[^\w.-]/g, "_") || "cv";
  const encodedName = encodeURIComponent(fileName).replace(/['()]/g, escape);

  return `attachment; filename="${fallbackName}"; filename*=UTF-8''${encodedName}`;
}

export async function GET() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    return NextResponse.json(
      { error: "Missing NEXT_PUBLIC_CONVEX_URL" },
      { status: 500 },
    );
  }

  const convex = new ConvexHttpClient(convexUrl);
  const cv = await convex.query(api.models.cv.get);

  if (!cv?.url) {
    return NextResponse.json({ error: "CV not found" }, { status: 404 });
  }

  const cvResponse = await fetch(cv.url);

  if (!cvResponse.ok || !cvResponse.body) {
    return NextResponse.json(
      { error: "Could not download CV" },
      { status: 502 },
    );
  }

  return new Response(cvResponse.body, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": contentDispositionFileName(cv.fileName),
      "Content-Length": String(cv.fileSize),
      "Content-Type":
        cvResponse.headers.get("Content-Type") ?? "application/octet-stream",
    },
  });
}
