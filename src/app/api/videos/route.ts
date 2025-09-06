// app/api/videos/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface YouTubeVideoItem {
  id?: {
    videoId?: string;
  };
  snippet?: {
    title?: string;
    channelTitle?: string;
    channelId?: string;
    description?: string;
    thumbnails?: {
      medium?: { url?: string };
      default?: { url?: string };
    };
    publishedAt?: string;
  };
}

interface YouTubeSearchResponse {
  items?: YouTubeVideoItem[];
  nextPageToken?: string;
}

interface YouTubeVideoDetailsItem {
  id?: string;
  status?: {
    madeForKids?: boolean;
  };
}

interface YouTubeVideoDetailsResponse {
  items?: YouTubeVideoDetailsItem[];
}

interface ProcessedVideo {
  title: string;
  channel: string;
  channelId: string;
  videoId: string;
  thumbnail?: string;
  publishedAt: string;
  url?: string;
  categoryHint: number;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const qRaw = String(searchParams.get('q') || 'stories for kids').trim();
    const q = qRaw.length ? qRaw : 'stories for kids';
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const pageSize = Math.min(Math.max(parseInt(searchParams.get('pageSize') || '20', 10), 1), 20);

    const YT_MAX = 50;
    const PAGES_PER_CAT = 2;
    const CATS = [27, 24, 10]; // YouTube category IDs for Education, Entertainment, Music

    // Whitelist of trusted channels for music category
    const WHITELIST = new Set([
      'UCbCmjCuTUZos6Inko4u57UQ',
      'UCPlwvN0w4qFSP1FllALB92w',
      'UCcdwLMPsaU2ezNSJU1nFoBQ',
      'UC9x0AN7BWHpCDHSm9NiJFJQ',
      'UCXJQ-jqFN8JwXvY4x7R5Q2A',
    ]);

    // Positive music patterns for kids content
    const POS_MUSIC = /\b(nursery|kids?|children'?s|kinder|toddlers?|preschool|rhymes?|lullab(y|ies)|phonics|abcs?|abc song|123|sing[-\s]?along|cocomelon|pinkfong|super simple|little baby bum|kidzbop|peppa pig|blippi|sesame|mother goose)\b/i;
    
    // Negative music patterns to exclude
    const NEG_MUSIC = /\b(official music video|explicit|vevo|lyrics?|live performance|mtv|remix|tiktok|club|trap|drill|nsfw)\b/i;
    
    // Generic negative patterns to exclude
    const NEG_GENERIC = /\b(prank|challenge|fail compilation|horror|violent|gore|gun|shooting|war|murder|crime|killer|18\+|NSFW)\b/i;

    const makeSearchUrl = (categoryId: number, pageToken = ''): string => {
      const params = new URLSearchParams({
        part: 'snippet',
        type: 'video',
        videoEmbeddable: 'true',
        safeSearch: 'strict',
        maxResults: String(YT_MAX),
        q: q,
        videoCategoryId: String(categoryId)
      });
      
      if (pageToken) params.set('pageToken', pageToken);
      if (process.env.YOUTUBE_API_KEY) params.set('key', process.env.YOUTUBE_API_KEY);
      
      return `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;
    };

    async function getMadeForKidsSet(ids: string[]): Promise<Set<string>> {
      const out = new Set<string>();
      
      // Process in batches of 50 (YouTube API limit)
      for (let i = 0; i < ids.length; i += 50) {
        const slice = ids.slice(i, i + 50);
        const params = new URLSearchParams({
          part: 'status',
          id: slice.join(',')
        });
        
        if (process.env.YOUTUBE_API_KEY) params.set('key', process.env.YOUTUBE_API_KEY);
        
        const url = `https://www.googleapis.com/youtube/v3/videos?${params.toString()}`;
        
        try {
          const response = await fetch(url);
          if (!response.ok) continue;
          
          const data: YouTubeVideoDetailsResponse = await response.json();
          for (const item of (data.items || [])) {
            if (item?.status?.madeForKids && item.id) {
              out.add(item.id);
            }
          }
        } catch (error) {
          console.error('Error checking made for kids status:', error);
          continue;
        }
      }
      return out;
    }

    const seen = new Set<string>();
    const keptRaw: ProcessedVideo[] = [];
    let reachedEndAll = true;

    const needCount = page * pageSize;
    const BUFFER = 60;
    const targetRaw = needCount + BUFFER;

    // Search across different categories
    for (const cat of CATS) {
      let token = '';
      let reachedEndThisCat = true;

      for (let p = 0; p < PAGES_PER_CAT; p++) {
        try {
          const response = await fetch(makeSearchUrl(cat, token));
          if (!response.ok) break;
          
          const data: YouTubeSearchResponse = await response.json();
          const items = Array.isArray(data.items) ? data.items : [];

          token = data.nextPageToken || '';
          if (token) reachedEndThisCat = false;

          for (const item of items) {
            const snippet = item.snippet || {};
            const id = item.id?.videoId || null;
            if (!id || seen.has(id)) continue;
            seen.add(id);

            const channelId = snippet.channelId || '';
            const title = (snippet.title || '').trim();
            const desc = (snippet.description || '').trim();
            const text = `${title} ${desc}`;

            // Filter out inappropriate content
            if (NEG_GENERIC.test(text)) continue;

            // Special filtering for music category (10)
            if (cat === 10 && !WHITELIST.has(channelId)) {
              if (!POS_MUSIC.test(text)) continue;
              if (NEG_MUSIC.test(text)) continue;
            }

            keptRaw.push({
              title: title || 'Untitled',
              channel: snippet.channelTitle || '',
              channelId,
              videoId: id,
              thumbnail: snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || undefined,
              publishedAt: snippet.publishedAt || '',
              url: id ? `https://youtu.be/${id}` : undefined,
              categoryHint: cat
            });

            if (keptRaw.length >= targetRaw) break;
          }

          if (keptRaw.length >= targetRaw) break;
          if (!token) break;
        } catch (error) {
          console.error(`Error searching category ${cat}:`, error);
          break;
        }
      }

      if (!reachedEndThisCat) reachedEndAll = false;
      if (keptRaw.length >= targetRaw) break;
    }

    // Check which videos are made for kids
    const ids = keptRaw.map(v => v.videoId);
    const kidsSet = await getMadeForKidsSet(ids);
    const kept = keptRaw.filter(v => kidsSet.has(v.videoId));

    // Paginate results
    const start = (page - 1) * pageSize;
    const pageItems = kept.slice(start, start + pageSize);
    const hasMore = kept.length > page * pageSize || !reachedEndAll;

    return NextResponse.json({
      items: pageItems,
      page,
      pageSize,
      hasMore
    });

  } catch (error) {
    console.error('Videos API error:', error);
    return NextResponse.json(
      { error: 'Videos fetch failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}