import { NextRequest, NextResponse } from "next/server";

// Proxies an HTTPS PDF/image and forces Content-Disposition: inline so the
// browser renders it instead of downloading. Use this for Cloudflare R2 URLs
// (or any external storage) that serve files with attachment disposition.
//
// Usage: /api/pdf-proxy?url=https://your-bucket.r2.dev/invoices/file.pdf

const ALLOWED_CONTENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url");

  if (!raw) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // Only proxy https:// to avoid SSRF to internal services
  if (url.protocol !== "https:") {
    return NextResponse.json({ error: "Only https URLs are supported" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(url.toString(), { redirect: "follow" });
  } catch {
    return NextResponse.json({ error: "Failed to fetch document" }, { status: 502 });
  }

  if (!upstream.ok) {
    return NextResponse.json({ error: "Upstream error" }, { status: upstream.status });
  }

  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
  const baseType = contentType.split(";")[0].trim();

  if (!ALLOWED_CONTENT_TYPES.some((t) => baseType === t)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
  }

  const body = await upstream.arrayBuffer();
  const filename = url.pathname.split("/").pop() ?? "document.pdf";

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
