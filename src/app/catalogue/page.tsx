"use client";

import { useState, useEffect } from "react";

interface Book {
  title: string;
  authors?: string[];
  snippet?: string;
  infoLink?: string;
  thumbnail?: string;
}

interface Video {
  title: string;
  channel?: string;
  url?: string;
  thumbnail?: string;
}

type Item = Book | Video;

export default function HomePage() {
  const [q, setQ] = useState<string>("");
  const [mode, setMode] = useState<"books" | "videos">("books");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to strip HTML tags from book snippet
  const stripHTML = (html?: string) => {
    if (!html) return "";
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const search = async () => {
    const query = q.trim() || "stories";
    const url =
      mode === "books"
        ? `/catalogue/books?q=${encodeURIComponent(query)}&lang=en&limit=8`
        : `/catalogue/videos?q=${encodeURIComponent(query + " for kids")}&limit=8`;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API returned status ${res.status}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch (e: any) {
      console.error(e);
      setError("Failed to load results: " + e.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    search();
  }, [mode]);

  return (
    <main className="bg-pink-50 min-h-screen py-10">
      <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-pink-600">Discover Books & Videos for Kids</h1>

        {/* Search */}
        <div className="flex gap-2 mb-4 text-gray-700">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Try 'dinosaurs', 'space', 'ballet'…"
            onKeyDown={(e) => e.key === "Enter" && search()}
            className="flex-1 p-2 border rounded-lg"
          />
          <button
            onClick={search}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
          >
            Search
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-4">
          <button
            onClick={() => setMode("books")}
            className={`px-4 py-2 mr-2 rounded-lg ${
              mode === "books" ? "bg-pink-600 text-white" : "bg-gray-200 text-gray-800"
            }`}
          >
            Books
          </button>
          <button
            onClick={() => setMode("videos")}
            className={`px-4 py-2 rounded-lg ${
              mode === "videos" ? "bg-pink-600 text-white" : "bg-gray-200 text-gray-800"
            }`}
          >
            Videos
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {loading && <p>Loading…</p>}
          {error && <p className="text-red-600">{error}</p>}
          {!loading && !error && items.length === 0 && <p>No results. Try another topic.</p>}
          {!loading &&
            !error &&
            items.map((x, idx) => (
              <div
                key={idx}
                className="border rounded-2xl p-4 bg-white shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-transform duration-300"
              >
                {x.thumbnail && (
                  <img
                    src={x.thumbnail}
                    alt={x.title}
                    className="w-full h-40 object-cover rounded-md mb-2"
                  />
                )}
                <h3 className="font-semibold">{x.title}</h3>
                {mode === "books" ? (
                  <>
                    <p className="text-gray-600">{(x as Book).authors?.join(", ")}</p>
                    {(x as Book).snippet && (
                      <p className="text-gray-700">{stripHTML((x as Book).snippet)}</p>
                    )}
                    {(x as Book).infoLink && (
                      <a
                        href={(x as Book).infoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-600 underline text-sm"
                      >
                        View on Google Books
                      </a>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-gray-600">{(x as Video).channel}</p>
                    {(x as Video).url && (
                      <a
                        href={(x as Video).url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-600 underline text-sm"
                      >
                        Watch on YouTube
                      </a>
                    )}
                  </>
                )}
              </div>
            ))}
        </div>
      </div>
    </main>
  );
}
