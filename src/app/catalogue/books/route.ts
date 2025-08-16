import { NextResponse } from "next/server";

const BOOKS_API_KEY = process.env.BOOKS_API_KEY || "";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = String(searchParams.get("q") || "stories");
    const limit = Math.min(parseInt(searchParams.get("limit") || "8", 10), 20);
    const debug = searchParams.get("debug") === "1";

    const apiFetch = async (qExpr: string, max = 40, startIndex = 0) => {
      const url =
        "https://www.googleapis.com/books/v1/volumes?q=" + encodeURIComponent(qExpr) +
        "&printType=books&orderBy=relevance&maxResults=" + Math.min(max, 40) +
        "&startIndex=" + startIndex +
        (BOOKS_API_KEY ? "&key=" + BOOKS_API_KEY : "");
      const r = await fetch(url);
      const data = await r.json();
      if (data?.error) throw new Error("Books API error: " + JSON.stringify(data.error));
      return Array.isArray(data.items) ? data.items : [];
    };

    // Queries
    const strictQ  = `${q} subject:juvenile OR subject:"children's books" OR subject:"young adult" OR subject:"picture books" OR subject:"middle grade"`;
    const kidTermsQ = `${q} (children OR kids OR juvenile OR "young adult" OR "middle grade" OR "picture book" OR toddler OR storybook)`;
    const plainQ   = q;

    const need = limit * 3;
    let pool: any[] = [];
    for (const query of [strictQ, kidTermsQ, plainQ]) {
      if (pool.length >= need) break;
      const batch = await apiFetch(query, need);
      const seenIds = new Set(pool.map(x => x.id));
      for (const item of batch) {
        if (!seenIds.has(item.id)) {
          pool.push(item);
          seenIds.add(item.id);
        }
      }
    }

    // Map heuristics
    const mapped = pool.map(v => {
      const info = v.volumeInfo || {};
    const cats: string[] = Array.isArray(info.categories)
      ? info.categories.map((s: string) => s.toLowerCase())
      : [];

      const title = (info.title || "").toLowerCase();
      const desc = (info.description || "").toLowerCase();

      const kidSafe = (info.maturityRating || "NOT_MATURE") === "NOT_MATURE";
      const looksKid =
        cats.some(c => /juvenile|children|picture|middle grade|young adult|teen|kids|child/.test(c)) ||
        /juvenile|children|kid|picture book|read-aloud|middle grade|ya|teen|storybook|toddler/.test(title) ||
        /juvenile|children|kid|picture book|read-aloud|middle grade|ya|teen|storybook|toddler/.test(desc);

      const looksAcademic =
        cats.some(c => /(mathematics|social science|philosophy|literary criticism|law|economics|engineering|physics|function spaces|banach|analysis)/.test(c)) ||
        /banach|hilbert|thermodynamics|vector lattice|operator|statistical mechanics|critical theory/.test(title);

      return {
        id: v.id || null,
        title: info.title || "Untitled",
        authors: info.authors || [],
        categories: info.categories || [],
        maturityRating: info.maturityRating || "UNKNOWN",
        thumbnail: info.imageLinks?.thumbnail || null,
        infoLink: info.infoLink || null,
        snippet: v.searchInfo?.textSnippet || null,
        _kidSafe: kidSafe,
        _looksKid: looksKid,
        _looksAcademic: looksAcademic
      };
    });

    // Dedupe
    const seenKey = new Set();
    const deduped = mapped.filter(x => {
      const key = (x.title + "|" + (x.authors[0] || "")).toLowerCase();
      if (seenKey.has(key)) return false;
      seenKey.add(key);
      return true;
    });

    // Pass filters
    const pass1 = deduped.filter(x => x._kidSafe && x._looksKid);
    const pass2 = deduped.filter(x => x._kidSafe && x.thumbnail && !x._looksAcademic && !pass1.includes(x));
    const pass3 = deduped.filter(x => x._kidSafe && !pass1.includes(x) && !pass2.includes(x));

    const filled = [...pass1, ...pass2, ...pass3]
      .slice(0, limit)
      .map(({ _kidSafe, _looksKid, _looksAcademic, ...rest }) => rest);

    if (debug) {
      return NextResponse.json({
        strictQ,
        poolSize: pool.length,
        pass1: pass1.length,
        pass2: pass2.length,
        pass3: pass3.length,
        returned: filled.length,
        items: filled
      });
    }

    return NextResponse.json({ items: filled });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Books fetch failed", details: e.message }, { status: 500 });
  }
}
