import { beforeEach, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  track: vi.fn(),
  auth: vi.fn(),
}));
vi.mock("convex/browser", () => ({
  ConvexHttpClient: class {
    query = mocks.query;
  },
}));
vi.mock("@/lib/track-cv-download", () => ({ trackCvDownload: mocks.track }));
vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth }));

import { GET as getPages } from "../app/cv/pages/route";
import { GET } from "../app/cv/route";
import { GET as getWord } from "../app/cv/word/route";

beforeEach(() => {
  vi.resetAllMocks();
  process.env.NEXT_PUBLIC_CONVEX_URL = "https://example.convex.cloud";
});
test("missing CV returns 404 and records no download", async () => {
  mocks.query.mockResolvedValue(null);
  expect((await GET(new Request("https://example.com/cv"))).status).toBe(404);
  expect(mocks.track).not.toHaveBeenCalled();
});
test("storage failure records no download", async () => {
  mocks.query.mockResolvedValue({
    url: "https://example.com/file",
    fileName: "cv.pdf",
    fileSize: 4,
  });
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(null, { status: 502 })),
  );
  expect((await GET(new Request("https://example.com/cv"))).status).toBe(502);
  expect(mocks.track).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
});
test("successful CV response streams attachment and records its format", async () => {
  mocks.query.mockResolvedValue({
    url: "https://example.com/file",
    fileName: "cv.pdf",
    fileSize: 4,
  });
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response("test", {
        headers: { "Content-Type": "application/pdf" },
      }),
    ),
  );
  const request = new Request("https://example.com/cv");
  const response = await GET(request);
  expect(response.status).toBe(200);
  expect(await response.text()).toBe("test");
  expect(response.headers.get("Content-Disposition")).toContain("attachment");
  expect(mocks.track).toHaveBeenCalledWith(request, "pdf");
  vi.unstubAllGlobals();
});
test("editable downloads still require authentication", async () => {
  mocks.auth.mockResolvedValue({ userId: null });
  expect(
    (await getWord(new Request("https://example.com/cv/word"))).status,
  ).toBe(401);
  expect(
    (await getPages(new Request("https://example.com/cv/pages"))).status,
  ).toBe(401);
  expect(mocks.track).not.toHaveBeenCalled();
  expect(mocks.query).not.toHaveBeenCalled();
});
