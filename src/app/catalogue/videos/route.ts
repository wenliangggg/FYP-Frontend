import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "stories";

  // Example using YouTube API (replace YOUR_API_KEY)
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${q}&maxResults=8&type=video&key=${process.env.YOUTUBE_API_KEY}`
  );
  const data = await res.json();

  // Map to simplified format
  const items = data.items?.map((v: any) => ({
    title: v.snippet.title,
    channel: v.snippet.channelTitle,
    url: `https://www.youtube.com/watch?v=${v.id.videoId}`,
    thumbnail: v.snippet.thumbnails?.high?.url,
  })) || [];

  return NextResponse.json({ items });
}
