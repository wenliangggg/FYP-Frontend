import { NextRequest, NextResponse } from "next/server";

const BOOKS_API_KEY = process.env.BOOKS_API_KEY || "";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q") || "";
    const shelf = searchParams.get("shelf") || "";
    const lang = searchParams.get("lang") || "en";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "8", 10);

    // ✅ Build search query
    let searchQuery = "";
    if (q && shelf) searchQuery = `${q} ${shelf} subject:juvenile`;
    else if (q) searchQuery = `${q} subject:juvenile`;
    else if (shelf) searchQuery = `${shelf} subject:juvenile`;
    else searchQuery = `subject:juvenile`; // default

    const url =
      "https://www.googleapis.com/books/v1/volumes?" +
      new URLSearchParams({
        q: searchQuery,
        printType: "books",
        orderBy: "relevance",
        maxResults: String(pageSize),
        startIndex: String((page - 1) * pageSize),
        langRestrict: lang,
        key: BOOKS_API_KEY,
      });

    const r = await fetch(url);
    if (!r.ok) throw new Error("Books fetch failed: " + r.status);
    const data = await r.json();

    const books = (data.items || []).map((v: any) => {
      const images = v.volumeInfo?.imageLinks || {};
      const rawThumb =
        images.extraLarge ||
        images.large ||
        images.medium ||
        images.thumbnail ||
        images.smallThumbnail ||
        null;

      return {
        id: v.id,
        title: v.volumeInfo?.title || "Untitled",
        authors: v.volumeInfo?.authors || [],
        infoLink: v.volumeInfo?.infoLink || "",
        // ✅ Always use proxy for images
        thumbnail: rawThumb
          ? `/api/proxy-image?url=${encodeURIComponent(rawThumb)}`
          : null,
        snippet: v.searchInfo?.textSnippet || "",
      };
    });

    return NextResponse.json({ items: books });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
