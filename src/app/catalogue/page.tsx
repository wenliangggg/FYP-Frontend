"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";

interface Book {
  id: string;
  title: string;
  authors: string[];
  infoLink: string;
  thumbnail: string;
  buckets?: string[];
}

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channel?: string;
  url?: string;
}

const shelves = [
  { key: "", label: "All" },
  { key: "juvenile_fiction", label: "Fiction" },
  { key: "juvenile_nonfiction", label: "Nonfiction" },
  { key: "education", label: "Education" },
  { key: "literature", label: "Literature" },
  { key: "early_readers", label: "Picture/Board/Early" },
  { key: "middle_grade", label: "Middle Grade" },
  { key: "poetry_humor", label: "Poetry & Humor" },
  { key: "biography", label: "Biography" },
  { key: "juvenile_other", label: "Other (Kids)" },
  { key: "young_adult", label: "Young Adult" },
];

export default function HomePage() {
  const [mode, setMode] = useState<"books" | "videos">("books");
  const [query, setQuery] = useState("");
  const [bucket, setBucket] = useState("");
  const [page, setPage] = useState(1);
  const [books, setBooks] = useState<Book[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [favourites, setFavourites] = useState<{ id: string; type: string }[]>(
    []
  );

  const pageSize = 20;

  // Watch auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) loadFavourites(u.uid);
      else setFavourites([]);
    });
    return () => unsub();
  }, []);

  // Load favourites from Firestore
  async function loadFavourites(uid: string) {
    const snap = await getDocs(collection(db, "users", uid, "favourites"));
    const favs: any[] = [];
    snap.forEach((doc) => favs.push(doc.data()));
    setFavourites(favs);
  }

  // Toggle favourite
async function toggleFavourite(item: any, type: "book" | "video") {
  if (!user) {
    alert("Please log in to favourite items.");
    return;
  }

  const exists = favourites.find((f) => f.id === item.id && f.type === type);
  const ref = doc(db, "users", user.uid, "favourites", item.id);

  if (exists) {
    // Remove from favourites
    await deleteDoc(ref);
    setFavourites(favourites.filter((f) => !(f.id === item.id && f.type === type)));
  } else {
    // Build a safe object for Firestore
    const newFav: any = {
      id: item.id,
      type,
      title: item.title || "",
    };

    if (item.thumbnail) newFav.thumbnail = item.thumbnail;
    if (item.authors) newFav.authors = item.authors;
    if (item.channel) newFav.channel = item.channel;
    if (item.infoLink) newFav.infoLink = item.infoLink;

    await setDoc(ref, newFav);
    setFavourites([...favourites, newFav]);
  }
}


  function isFavourite(id: string, type: "book" | "video") {
    return favourites.some((f) => f.id === id && f.type === type);
  }

  // Search API
  useEffect(() => {
    search();
  }, [mode, page, bucket]);

  async function search() {
    setLoading(true);
    try {
      if (mode === "books") {
        const params = new URLSearchParams({
          q: query,
          shelf: bucket,
          lang: "en",
          page: String(page),
          pageSize: String(pageSize),
        });
        const res = await fetch(`/catalogue/books?${params.toString()}`);
        const data = await res.json();
        setBooks(data.items || []);
      } else {
        const params = new URLSearchParams({
          q: query || "stories for kids",
          page: String(page),
          pageSize: String(pageSize),
        });
        const res = await fetch(`/catalogue/videos?${params.toString()}`);
        const data = await res.json();
        setVideos(data.items || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  return (
    <main className="bg-white">
      <div className="max-w-[1100px] mx-auto p-6 font-sans text-[#111]">
        <h1 className="mb-3 text-2xl font-bold">
          Discover Books & Videos for Kids
        </h1>

        {/* Search */}
        <div className="flex gap-2 mb-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles/topics (optional)…"
            className="flex-1 border border-[#ddd] rounded-xl px-3 py-2"
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
          <button
            onClick={() => {
              setPage(1);
              search();
            }}
            className="px-4 py-2 rounded-xl bg-[#111] text-white"
          >
            Search
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => {
              setMode("books");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl ${
              mode === "books" ? "bg-[#111] text-white" : "bg-[#f2f2f2]"
            }`}
          >
            Books
          </button>
          <button
            onClick={() => {
              setMode("videos");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl ${
              mode === "videos" ? "bg-[#111] text-white" : "bg-[#f2f2f2]"
            }`}
          >
            Videos
          </button>
        </div>

        {/* Results */}
        {loading ? (
          <p>Loading…</p>
        ) : mode === "books" ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
            {books.map((b) => (
              <div
                key={b.id}
                className="border border-[#eee] rounded-xl p-3 flex flex-col gap-2"
              >
                <img
                  src={b.thumbnail || "/images/book-placeholder.png"}
                  alt=""
                  className="w-full h-[165px] object-cover rounded-lg bg-[#fafafa]"
                />
                <div>
                  <strong>{b.title}</strong>
                  <div className="text-sm text-[#666]">
                    {b.authors?.join(", ") || "Unknown author"}
                  </div>
                </div>
                {b.infoLink && (
                  <a
                    href={b.infoLink}
                    target="_blank"
                    rel="noopener"
                    className="text-[#0a58ca] text-sm"
                  >
                    View on Google Books
                  </a>
                )}
                {user && (
                  <button
                    onClick={() => toggleFavourite(b, "book")}
                    className="px-2 py-1 mt-2 text-sm rounded-lg border"
                  >
                    {isFavourite(b.id, "book")
                      ? "★ Remove Favourite"
                      : "☆ Add Favourite"}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
            {videos.map((v) => (
              <div
                key={v.id}
                className="border border-[#eee] rounded-xl p-3 flex flex-col gap-2"
              >
                {v.thumbnail && (
                  <img
                    src={v.thumbnail}
                    alt=""
                    className="w-full h-[165px] object-cover rounded-lg bg-[#fafafa]"
                  />
                )}
                <div>
                  <strong>{v.title}</strong>
                  <div className="text-sm text-[#666]">{v.channel || ""}</div>
                </div>
                {v.id && (
                  <a
                    href={`https://www.youtube.com/watch?v=${v.id}`}
                    target="_blank"
                    rel="noopener"
                    className="text-[#0a58ca] text-sm"
                  >
                    Watch on YouTube
                  </a>
                )}
                {user && (
                  <button
                    onClick={() => toggleFavourite(v, "video")}
                    className="px-2 py-1 mt-2 text-sm rounded-lg border"
                  >
                    {isFavourite(v.id, "video")
                      ? "★ Remove Favourite"
                      : "☆ Add Favourite"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
