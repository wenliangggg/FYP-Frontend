// app/api/books/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface BookItem {
  id?: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    categories?: string[];
    maturityRating?: string;
    imageLinks?: {
      thumbnail?: string;
    };
    previewLink?: string;
    canonicalVolumeLink?: string;
    infoLink?: string;
    subtitle?: string;
    description?: string;
  };
  searchInfo?: {
    textSnippet?: string;
  };
}

interface GoogleBooksResponse {
  totalItems?: number;
  items?: BookItem[];
}

interface ProcessedBook {
  id: string | null;
  title: string;
  authors: string[];
  categories: string[];
  maturityRating: string;
  thumbnail: string | null;
  previewLink: string | null;
  canonicalVolumeLink: string | null;
  infoLink: string | null;
  bestLink: string | null;
  snippet: string | null
  synopsis: string | null;
  buckets?: string[];
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawQ = searchParams.get('q') || '';
    const q = String(rawQ).trim();
    const lang = String(searchParams.get('lang') || '');

    // Optional server-side bucket filter (leave empty for All)
    const wantBucket = String(searchParams.get('bucket') || '').toLowerCase();
    const includeYA = searchParams.get('includeYA') === '1' || wantBucket === 'young_adult';

    // Pagination
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const pageSize = Math.min(Math.max(parseInt(searchParams.get('pageSize') || '20', 10), 1), 40);
    const debug = searchParams.get('debug') === '1';

    // Google Books paging/fanout
    const GB_MAX = 40; // per-call max
    const MAX_GB_PAGES = 50; // depth per query (≈2000 raw/seed)
    const RAW_LIMIT_HARD = 4000; // global safety cap

    // Helper: make plural-ish variants for single-word queries
    function variantsFor(q: string): string[] {
      const parts = q.split(/\s+/).filter(Boolean);
      const vs = new Set([q]);
      if (parts.length === 1 && parts[0].length >= 3) {
        vs.add(parts[0] + 's');
        if (/y$/i.test(parts[0])) {
          vs.add(parts[0].replace(/y$/i, 'ies'));
        }
      }
      return Array.from(vs);
    }

    // Default fanout when q is empty
    const seedSubjects = [
      'subject:juvenile',
      'subject:"early reader"',
      'subject:"board book"',
      'subject:"picture book"',
      'subject:"children\'s"',
      'subject:"children"',
      'subject:"juvenile fiction"',
      'subject:"juvenile nonfiction"'
    ];

    // If user typed something, try many kid-focused variants
    const queries = (q && q.trim())
      ? (() => {
          const vs = variantsFor(q);
          const arr: string[] = [];
          for (const term of vs) {
            arr.push(`${term} subject:juvenile`);
            arr.push(`intitle:${term} subject:juvenile`);
            arr.push(`${term} subject:"children's"`);
            arr.push(`${term} subject:"children"`);
            arr.push(`${term} subject:"picture book"`);
            arr.push(`${term} subject:"early reader"`);
            arr.push(`${term} subject:"board book"`);
            arr.push(`${term} subject:"juvenile fiction"`);
            arr.push(`${term} subject:"juvenile nonfiction"`);
            arr.push(`${term} subject:"children's literature"`);
            arr.push(`${term} subject:"juvenile literature"`);
          }
          return Array.from(new Set(arr));
        })()
      : seedSubjects;

    const makeUrl = (qExpr: string, startIndex = 0): string => {
      const baseUrl = 'https://www.googleapis.com/books/v1/volumes';
      const params = new URLSearchParams({
        q: qExpr,
        printType: 'books',
        orderBy: 'relevance',
        maxResults: String(GB_MAX),
        startIndex: String(startIndex),
      });
      
      if (lang) params.set('langRestrict', lang);
      if (process.env.BOOKS_API_KEY) params.set('key', process.env.BOOKS_API_KEY);
      
      return `${baseUrl}?${params.toString()}`;
    };

    // Multi-bucket classifier (post-fetch)
    function assignBuckets(catsLC: string[], textAllLC: string): string[] | undefined {
      const buckets: string[] = [];
      const has = (substr: string) => catsLC.some(c => c.includes(substr));
      const re = (rx: RegExp) => rx.test(textAllLC);

      if (has('young adult') || re(/\byoung[-\s]?adult\b/)) buckets.push('young_adult');

      if (has('juvenile fiction')) buckets.push('juvenile_fiction');
      if (has('juvenile nonfiction')) buckets.push('juvenile_nonfiction');

      if (
        has('juvenile literature') ||
        has('children\'s literature') ||
        re(/\b(children'?s|juvenile)\s+literature\b/) ||
        catsLC.some(c => /literature/i.test(c) && /children|juvenile|kids?/i.test(c))
      ) {
        buckets.push('literature');
      }

      if (
        has('juvenile biography') ||
        (has('biography & autobiography') && (has('juvenile') || re(/\bchildren|juvenile|kids?\b/))) ||
        re(/\bbiograph|autobiograph|life of\b/) ||
        re(/\bwho (?:is|was)\b/)
      ) {
        buckets.push('biography');
      }

      if (
        has('juvenile poetry') || has('juvenile humor') || has('juvenile humour') ||
        re(/\b(poem|poems|poetry|rhyme|rhymes|verse|limerick|jokes?|humou?r|funny|laugh|giggle)\b/)
      ) {
        buckets.push('poetry_humor');
      }

      if (
        has('picture') || has('picture book') || has('board book') ||
        has('early reader') || has('beginning reader') ||
        re(/\b(picture book|board book|early reader|beginning reader|leveled reader|sight words?)\b/)
      ) {
        buckets.push('early_readers');
      }

      if (
        has('middle grade') || re(/\bmiddle[-\s]?grade\b/) ||
        re(/\b(ages?\s*8[-–]12|ages?\s*9[-–]12|grade[s]?\s*4[-–]7|age\s*8\s*to\s*12)\b/)
      ) {
        buckets.push('middle_grade');
      }

      if (
        has('education') || 
        re(/\b(education|educational|study and teaching|curriculum|phonics|sight words?)\b/)
      ) {
        buckets.push('education');
      }

      if (catsLC.some(c => c.startsWith('juvenile'))) buckets.push('juvenile_other');

      return buckets.length ? buckets : undefined;
    }

    // Fetch/merge/dedupe, prefer covers
    const needCount = page * pageSize;
    const OVERFETCH = Math.max(60, Math.ceil(pageSize * 6));
    const targetCount = needCount + OVERFETCH;

    const seen = new Set<string>();
    const withImgPool: ProcessedBook[] = [];
    const withoutImgPool: ProcessedBook[] = [];

    let totalRaw = 0;
    let approxTotal = 0;
    let reachedEndAll = true;

    for (const qExpr of queries) {
      let startIndex = 0;
      let reachedEndThis = true;

      for (let p = 0; p < MAX_GB_PAGES; p++) {
        if (totalRaw >= RAW_LIMIT_HARD) {
          reachedEndThis = true;
          break;
        }

        const response = await fetch(makeUrl(qExpr, startIndex));
        if (!response.ok) {
          reachedEndThis = true;
          break;
        }
        
        const data: GoogleBooksResponse = await response.json();

        if (typeof data?.totalItems === 'number') {
          approxTotal = Math.max(approxTotal, data.totalItems);
        }

        const items = Array.isArray(data.items) ? data.items : [];
        totalRaw += items.length;

        for (const v of items) {
          if (!v || !v.id || seen.has(v.id)) continue;
          seen.add(v.id);

          const info = v.volumeInfo || {};
          const rawCats = Array.isArray(info.categories) ? info.categories : [];
          const catsLC = rawCats.map(s => String(s).toLowerCase());

          const titleLC = (info.title || '').toLowerCase();
          const subtitleLC = (info.subtitle || '').toLowerCase();
          const descLC = (info.description || '').toLowerCase();
          const textAllLC = `${titleLC} ${subtitleLC} ${descLC}`;

          const buckets = assignBuckets(catsLC, textAllLC);
          const kidSafe = (info.maturityRating || 'NOT_MATURE') === 'NOT_MATURE';

          if (!kidSafe) continue;
          if (!includeYA && Array.isArray(buckets) && buckets.includes('young_adult')) continue;
          if (wantBucket && !(Array.isArray(buckets) && buckets.includes(wantBucket))) continue;

          const bestLink = info.previewLink || info.canonicalVolumeLink || info.infoLink ||
                          (v.id ? `https://books.google.com/books?id=${encodeURIComponent(v.id)}` : null);

          const rec: ProcessedBook = {
            id: v.id || null,
            title: info.title || 'Untitled',
            authors: info.authors || [],
            categories: rawCats,
            maturityRating: info.maturityRating || 'UNKNOWN',
            thumbnail: info.imageLinks?.thumbnail || null,
            previewLink: info.previewLink || null,
            canonicalVolumeLink: info.canonicalVolumeLink || null,
            infoLink: info.infoLink || null,
            bestLink,
            snippet: v.searchInfo?.textSnippet || null,
            synopsis: info.description || v.searchInfo?.textSnippet || null,
            buckets
          };

          if (rec.thumbnail) {
            withImgPool.push(rec);
          } else {
            withoutImgPool.push(rec);
          }

          if (withImgPool.length + withoutImgPool.length >= targetCount) break;
        }

        if (withImgPool.length + withoutImgPool.length >= targetCount) break;
        if (items.length < 40) {
          reachedEndThis = true;
          break;
        }
        startIndex += 40;
      }

      if (!reachedEndThis) reachedEndAll = false;
      if (withImgPool.length + withoutImgPool.length >= targetCount) break;
    }

    const ordered = withImgPool.concat(withoutImgPool);
    const start = (page - 1) * pageSize;
    const pageItems = ordered.slice(start, start + pageSize);
    const hasMore = ordered.length > page * pageSize || !reachedEndAll;

    if (debug) {
      return NextResponse.json({
        queries,
        lang: lang || '(none)',
        page,
        pageSize,
        totalRaw,
        withImg: withImgPool.length,
        withoutImg: withoutImgPool.length,
        returned: pageItems.length,
        hasMore,
        totalApprox: approxTotal,
        coverRate: withImgPool.length / Math.max(1, (withImgPool.length + withoutImgPool.length))
      });
    }

    return NextResponse.json({
      items: pageItems,
      page,
      pageSize,
      hasMore,
      totalApprox: approxTotal
    });

  } catch (error) {
    console.error('Books API error:', error);
    return NextResponse.json(
      { error: 'Books fetch failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}