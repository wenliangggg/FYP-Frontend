"use client";

import { useState, useEffect } from "react";

export default function HomePage() {
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<"books" | "videos">("books");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    const query = q.trim() || "stories";
    const base = "/api"; // adjust if your function endpoint is different
const url =
  mode === "books"
    ? `/catalogue/books?q=${encodeURIComponent(query)}&lang=en&limit=8`
    : `/catalogue/videos?q=${encodeURIComponent(query + " for kids")}&limit=8`;


    setLoading(true);
    setError(null);

try {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API returned status ${res.status}`);
  }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return (
    <main style={{ fontFamily: "system-ui, Arial", padding: "20px", maxWidth: "1000px", margin: "auto" }}>
      <h1>Discover Books &amp; Videos for Kids</h1>

      {/* Search Row */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Try 'dinosaurs', 'space', 'ballet'…"
          onKeyDown={(e) => e.key === "Enter" && search()}
          style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "8px", flex: 1 }}
        />
        <button
          onClick={search}
          style={{ padding: "8px 12px", border: 0, background: "#111", color: "#fff", borderRadius: "8px", cursor: "pointer" }}
        >
          Search
        </button>
      </div>

      {/* Tabs */}
      <div style={{ margin: "12px 0" }}>
        <button
          onClick={() => setMode("books")}
          style={{
            background: mode === "books" ? "#111" : "#eee",
            color: mode === "books" ? "#fff" : "#111",
            padding: "8px 12px",
            border: 0,
            borderRadius: "8px",
            marginRight: "8px",
            cursor: "pointer",
          }}
        >
          Books
        </button>
        <button
          onClick={() => setMode("videos")}
          style={{
            background: mode === "videos" ? "#111" : "#eee",
            color: mode === "videos" ? "#fff" : "#111",
            padding: "8px 12px",
            border: 0,
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Videos
        </button>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
          gap: "16px",
        }}
      >
        {loading && <p>Loading…</p>}
        {error && <p>{error}</p>}
        {!loading && !error && items.length === 0 && <p>No results. Try another topic.</p>}
        {!loading &&
          !error &&
          items.map((x, idx) => (
            <div key={idx} style={{ border: "1px solid #ddd", borderRadius: "12px", padding: "12px" }}>
              {x.thumbnail && (
                <img
                  src={x.thumbnail}
                  alt=""
                  style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "8px" }}
                />
              )}
              <h3>{x.title}</h3>
              {mode === "books" ? (
                <>
                  <p>{(x.authors || []).join(", ")}</p>
                  {x.snippet && <p>{x.snippet}</p>}
                  {x.infoLink && (
                    <p>
                      <a href={x.infoLink} target="_blank" rel="noopener noreferrer">
                        View on Google Books
                      </a>
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p>{x.channel || ""}</p>
                  {x.url && (
                    <p>
                      <a href={x.url} target="_blank" rel="noopener noreferrer">
                        Watch on YouTube
                      </a>
                    </p>
                  )}
                </>
              )}
            </div>
          ))}
      </div>
    </main>
  );
}
