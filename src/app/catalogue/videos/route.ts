import { NextRequest, NextResponse } from "next/server";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const qRaw = String(url.searchParams.get("q") || "stories for kids").trim();
    const q = qRaw || "stories for kids";
    const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);
    const pageSize = Math.min(Math.max(parseInt(url.searchParams.get("pageSize") || "20", 10), 1), 20);

    const YT_MAX = 50;
    const CATS = [27, 24, 10]; // kids music, entertainment, etc.
    const WHITELIST = new Set([
      "UCbCmjCuTUZos6Inko4u57UQ",
      "UCPlwvN0w4qFSP1FllALB92w",
      "UCcdwLMPsaU2ezNSJU1nFoBQ",
      "UC9x0AN7BWHpCDHSm9NiJFJQ",
      "UCXJQ-jqFN8JwXvY4x7R5Q2A",
    ]);

    const POS_MUSIC = /\b(nursery|kids?|children'?s|kinder|toddlers?|preschool|rhymes?|lullab(y|ies)|phonics|abcs?|abc song|123|sing[-\s]?along|cocomelon|pinkfong|super simple|little baby bum|kidzbop|peppa pig|blippi|sesame|mother goose)\b/i;
    const NEG_MUSIC = /\b(official music video|explicit|vevo|lyrics?|live performance|mtv|remix|tiktok|club|trap|drill|nsfw)\b/i;
    const NEG_GENERIC = /\b(prank|challenge|fail compilation|horror|violent|gore|gun|shooting|war|murder|crime|killer|18\+|NSFW)\b/i;

    const seen = new Set<string>();
    const keptRaw: any[] = [];

    const needCount = page * pageSize;
    const BUFFER = 60;
    const targetRaw = needCount + BUFFER;

    for (const cat of CATS) {
      let token = "";
      let reachedEndThisCat = true;

      for (let p = 0; p < 2; p++) { // pages per category
        const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&safeSearch=strict&maxResults=${YT_MAX}&q=${encodeURIComponent(q)}&videoCategoryId=${cat}${token ? `&pageToken=${token}` : ""}${YOUTUBE_API_KEY ? `&key=${YOUTUBE_API_KEY}` : ""}`;
        const r = await fetch(apiUrl);
        if (!r.ok) break;
        const data = await r.json();
        const items = Array.isArray(data.items) ? data.items : [];
        token = data.nextPageToken || "";
        if (token) reachedEndThisCat = false;

        for (const it of items) {
          const s = it.snippet || {};
          const id = it.id?.videoId || null;
          if (!id || seen.has(id)) continue;
          seen.add(id);

          const channelId = s.channelId || "";
          const title = (s.title || "").trim();
          const desc = (s.description || "").trim();
          const text = `${title} ${desc}`;

          if (NEG_GENERIC.test(text)) continue;
          if (cat === 10 && !WHITELIST.has(channelId)) {
            if (!POS_MUSIC.test(text)) continue;
            if (NEG_MUSIC.test(text)) continue;
          }

          keptRaw.push({
            id,
            title: title || "Untitled",
            description: desc,
            channel: s.channelTitle || "",
            thumbnail: s.thumbnails?.medium?.url || s.thumbnails?.default?.url || null,
            url: id ? `https://youtu.be/${id}` : null,
            type: "video",
          });

          if (keptRaw.length >= targetRaw) break;
        }
        if (keptRaw.length >= targetRaw || !token) break;
      }
      if (!reachedEndThisCat) break;
      if (keptRaw.length >= targetRaw) break;
    }

    const start = (page - 1) * pageSize;
    const pageItems = keptRaw.slice(start, start + pageSize);

    return NextResponse.json({ items: pageItems, page, pageSize });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Videos fetch failed", details: e }, { status: 500 });
  }
}
