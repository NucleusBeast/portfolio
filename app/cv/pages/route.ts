import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { trackCvDownload } from "@/lib/track-cv-download";

function contentDispositionFileName(fileName: string) {
  const fallbackName = fileName.replace(/[^\w.-]/g, "_") || "cv.pages";
  const encodedName = encodeURIComponent(fileName).replace(/['()]/g, escape);

  return `attachment; filename="${fallbackName}"; filename*=UTF-8''${encodedName}`;
}

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    return NextResponse.json(
      { error: "Missing NEXT_PUBLIC_CONVEX_URL" },
      { status: 500 },
    );
  }

  const convex = new ConvexHttpClient(convexUrl);
  const cv = await convex.query(api.models.cv.get);

  if (!cv?.pagesUrl || !cv.pagesFileName || !cv.pagesFileSize) {
    return NextResponse.json({ error: "Pages CV not found" }, { status: 404 });
  }

  const cvResponse = await fetch(cv.pagesUrl);

  if (!cvResponse.ok || !cvResponse.body) {
    return NextResponse.json(
      { error: "Could not download Pages CV" },
      { status: 502 },
    );
  }

  await trackCvDownload(request, "pages");

  return new Response(cvResponse.body, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": contentDispositionFileName(cv.pagesFileName),
      "Content-Length": String(cv.pagesFileSize),
      "Content-Type":
        cvResponse.headers.get("Content-Type") ?? "application/vnd.apple.pages",
    },
  });
}
