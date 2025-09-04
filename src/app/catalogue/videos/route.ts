import { NextRequest, NextResponse } from "next/server";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q") || "";
    const pageSize = parseInt(searchParams.get("pageSize") || "8", 10);

    const url =
      "https://www.googleapis.com/youtube/v3/search?" +
      new URLSearchParams({
        q,
        type: "video",
        videoEmbeddable: "true",
        maxResults: String(pageSize),
        part: "snippet",
        key: YOUTUBE_API_KEY,
      });

    const r = await fetch(url);
    if (!r.ok) throw new Error("Videos fetch failed: " + r.status);
    const data = await r.json();

    const videos = (data.items || []).map((v: any) => ({
      id: v.id?.videoId,
      title: v.snippet?.title,
      description: v.snippet?.description,
      thumbnail: v.snippet?.thumbnails?.default?.url,
    }));

    return NextResponse.json({ items: videos });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
