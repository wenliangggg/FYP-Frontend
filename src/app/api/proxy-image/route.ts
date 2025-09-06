import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
      return new NextResponse("Missing url", { status: 400 });
    }

    const r = await fetch(url);
    if (!r.ok) {
      // ⚠️ If Google fails, serve local placeholder
      return await servePlaceholder();
    }

    const contentType = r.headers.get("content-type") || "image/jpeg";
    const buffer = await r.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    // ⚠️ On error, serve placeholder
    return await servePlaceholder();
  }
}

async function servePlaceholder() {
  const filePath = path.join(process.cwd(), "public/images/book-placeholder.png");
  const fileBuffer = await fs.readFile(filePath);

  // ✅ Convert Node Buffer → Uint8Array for NextResponse
  return new NextResponse(new Uint8Array(fileBuffer), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
