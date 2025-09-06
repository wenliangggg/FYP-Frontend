'use client';

import Chatbot from "../components/Chatbot";
import { useEffect, useState, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";

// ---------- Types ----------
interface Book {
  id: string;
  title: string;
  authors?: string[];
  synopsis?: string;
  infoLink?: string;
  thumbnail?: string | null;
  buckets?: string[];
}

interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  channel?: string;
  url?: string;
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  content: string;
}

// ---------- Shelves ----------
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

// ---------- Type guards ----------
function isBook(item: Book | Video): item is Book {
  return (item as Book).infoLink !== undefined;
}
function isVideo(item: Book | Video): item is Video {
  return (item as Video).channel !== undefined;
}

// ---------- Component ----------
export default function HomePage() {
  const [mode, setMode] = useState<"books" | "videos">("books");
  const [queryText, setQueryText] = useState("");
  const [bucket, setBucket] = useState("");
  const [page, setPage] = useState(1);
  const [books, setBooks] = useState<Book[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [favourites, setFavourites] = useState<any[]>([]);
  const [reviewsMap, setReviewsMap] = useState<Record<string, Review[]>>({});

  const [selectedItem, setSelectedItem] = useState<Book | Video | null>(null);
  const [reviewContent, setReviewContent] = useState("");

  const reviewRef = useRef<HTMLTextAreaElement | null>(null);

  const pageSize = 12;

  const getType = (m: "books" | "videos"): "book" | "video" =>
    m === "books" ? "book" : "video";

  // ---------- Auth ----------
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) loadFavourites(u.uid);
      else setFavourites([]);
    });
    return () => unsub();
  }, []);

  // ---------- Search ----------
  useEffect(() => {
    search();
  }, [mode, page, bucket]);

  async function search() {
    setLoading(true);
    try {
      if (mode === "books") {
        const params = new URLSearchParams({
          q: queryText || "children books",
          startIndex: String((page - 1) * pageSize),
          maxResults: String(pageSize),
          key: process.env.NEXT_PUBLIC_BOOKS_API_KEY || "",
        });
        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes?${params.toString()}`
        );
        const data = await res.json();

        const mapped: Book[] = (data.items || []).map((b: any) => ({
          id: b.id,
          title: b.volumeInfo.title,
          authors: b.volumeInfo.authors,
          synopsis: b.volumeInfo.description,
          thumbnail: b.volumeInfo.imageLinks?.thumbnail || null,
          infoLink: b.volumeInfo.infoLink,
          buckets: b.volumeInfo.categories || [],
        }));

        const filtered = bucket
          ? mapped.filter((b) => b.buckets?.includes(bucket))
          : mapped;

        setBooks(filtered);
        filtered.forEach((b) => loadReviewsForItem(b.id));
      } else {
        const params = new URLSearchParams({
          q: queryText || "stories for kids",
          part: "snippet",
          maxResults: String(pageSize),
          type: "video",
          key: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || "",
        });

        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/search?${params.toString()}`
        );
        const data = await res.json();

        const videoIds = (data.items || [])
          .map((i: any) => i.id?.videoId)
          .filter(Boolean);

        if (videoIds.length > 0) {
          const detailsRes = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoIds.join(
              ","
            )}&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}`
          );
          const detailsData = await detailsRes.json();

          const mappedVideos: Video[] = (detailsData.items || []).map((v: any) => ({
            id: v.id,
            title: v.snippet.title,
            description: v.snippet.description,
            thumbnail: v.snippet.thumbnails?.medium?.url,
            channel: v.snippet.channelTitle,
            url: `https://www.youtube.com/watch?v=${v.id}`,
          }));

          setVideos(mappedVideos);
          mappedVideos.forEach((v) => loadReviewsForItem(v.id));
        } else {
          setVideos([]);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  // ---------- Favourites ----------
  async function loadFavourites(uid: string) {
    const snap = await getDocs(collection(db, "users", uid, "favourites"));
    const favs: any[] = [];
    snap.forEach((doc) => favs.push(doc.data()));
    setFavourites(favs);
  }

  function isFavourite(id: string, type: "book" | "video") {
    return favourites.some((f) => f.id === id && f.type === type);
  }

  async function toggleFavourite(item: any, type: "book" | "video") {
    if (!user) return alert("Please log in to favourite items.");
    const exists = favourites.find((f) => f.id === item.id && f.type === type);
    const ref = doc(db, "users", user.uid, "favourites", item.id);

    if (exists) {
      await deleteDoc(ref);
      setFavourites(favourites.filter((f) => !(f.id === item.id && f.type === type)));
    } else {
      const newFav: any = { id: item.id, type, title: item.title || "" };
      if ("thumbnail" in item && item.thumbnail) newFav.thumbnail = item.thumbnail;
      if ("authors" in item && item.authors) newFav.authors = item.authors;
      if ("channel" in item && item.channel) newFav.channel = item.channel;
      if ("infoLink" in item && item.infoLink) newFav.infoLink = item.infoLink;

      await setDoc(ref, newFav);
      setFavourites([...favourites, newFav]);
    }
  }

  // ---------- Reviews ----------
  async function submitReview() {
    if (!user || !selectedItem) return;
    await addDoc(collection(db, "books-video-reviews"), {
      userId: user.uid,
      userName: user.displayName || "Anonymous",
      itemId: selectedItem.id,
      type: getType(mode),
      title: selectedItem.title,
      content: reviewContent,
      createdAt: Timestamp.now(),
    });
    setReviewContent("");
    await loadReviewsForItem(selectedItem.id);
  }

  async function loadReviewsForItem(itemId: string) {
    const q = query(
      collection(db, "books-video-reviews"),
      where("itemId", "==", itemId),
      orderBy("createdAt", "desc"),
      limit(3)
    );
    const snap = await getDocs(q);
    const revs: Review[] = [];
    snap.forEach((doc) => revs.push({ id: doc.id, ...doc.data() } as Review));
    setReviewsMap((prev) => ({ ...prev, [itemId]: revs }));
  }

  async function reportReview(reviewId: string) {
    if (!user) return;
    const reason = prompt("Optional: reason for reporting this review");
    if (reason === null) return;
    await addDoc(collection(db, "reports"), {
      reviewId,
      reportedBy: user.uid,
      reason,
      createdAt: Timestamp.now(),
    });
    alert("Review reported. Admin will check it.");
  }

  async function reportContent(item: any, type: "book" | "video") {
    if (!user) return alert("Please log in to report content.");
    const reason = prompt("Why are you reporting this content? (optional)");
    if (reason === null) return;
    await addDoc(collection(db, "reports-contents"), {
      itemId: item.id,
      type,
      title: item.title,
      reportedBy: user.uid,
      reason,
      createdAt: Timestamp.now(),
    });
    alert("Content reported. Admin will review it.");
  }

  // ---------- Utils ----------
  function getInitials(title: string) {
    if (!title) return "?";
    const words = title.trim().split(" ");
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  const colors = ["#F59E0B", "#10B981", "#3B82F6", "#EC4899", "#8B5CF6", "#EF4444"];
  function getColor(key: string) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  const handleLeaveReview = () => {
    setTimeout(() => {
      reviewRef.current?.scrollIntoView({ behavior: "smooth" });
      reviewRef.current?.focus();
    }, 100);
  };

  // ---------- Render ----------
  return (
    <main className="bg-white">
      <div className="max-w-[1100px] mx-auto p-6 font-sans text-[#111]">
        <h1 className="mb-3 text-2xl font-bold">Discover Books & Videos for Kids</h1>

        {/* Search */}
        <div className="flex gap-2 mb-3">
          <input
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Search titles/topics (optional)…"
            className="flex-1 border border-[#ddd] rounded-xl px-3 py-2"
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
          <button
            onClick={() => { setPage(1); search(); }}
            className="px-4 py-2 rounded-xl bg-[#111] text-white"
          >
            Search
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => { setMode("books"); setPage(1); }}
            className={`px-4 py-2 rounded-xl ${mode === "books" ? "bg-[#111] text-white" : "bg-[#f2f2f2]"}`}
          >
            Books
          </button>
          <button
            onClick={() => { setMode("videos"); setPage(1); }}
            className={`px-4 py-2 rounded-xl ${mode === "videos" ? "bg-[#111] text-white" : "bg-[#f2f2f2]"}`}
          >
            Videos
          </button>
        </div>

        {/* Shelves */}
        {mode === "books" && (
          <div className="flex flex-wrap gap-2 mb-4">
            {shelves.map((s) => (
              <span
                key={s.key}
                onClick={() => { setBucket(s.key); setPage(1); }}
                className={`px-3 py-1 rounded-full border cursor-pointer ${
                  bucket === s.key
                    ? "bg-[#111] text-white border-[#111]"
                    : "bg-[#f2f2f2] border-[#e6e6e6]"
                }`}
              >
                {s.label}
              </span>
            ))}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <p>Loading…</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
            {(mode === "books" ? books : videos).length === 0 ? (
              <p>No items found.</p>
            ) : (
              (mode === "books" ? books : videos).map((item: Book | Video) => (
                <div
                  key={item.id}
                  className="border border-[#eee] rounded-xl p-3 flex flex-col gap-2 cursor-pointer hover:shadow-md"
                  onClick={() => setSelectedItem(item)}
                >
                  {"thumbnail" in item && item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-[165px] object-cover rounded-lg bg-[#fafafa]"
                    />
                  ) : (
                    <div
                      className="w-full h-[165px] flex items-center justify-center rounded-lg text-white text-xl font-bold"
                      style={{ backgroundColor: getColor(item.id || item.title) }}
                    >
                      {getInitials(item.title)}
                    </div>
                  )}
                  <div>
                    <strong>{item.title}</strong>
                    {isBook(item) && (
                      <div className="text-sm text-[#666]">
                        {item.authors?.join(", ") || "Unknown author"}
                      </div>
                    )}
                    {isVideo(item) && (
                      <div className="text-sm text-[#666]">{item.channel || ""}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pager */}
        <div className="flex gap-2 justify-center mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded-lg disabled:opacity-50"
          >
            ‹ Prev
          </button>
          <span>Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded-lg"
          >
            Next ›
          </button>
        </div>
      </div>

      {/* Selected Item Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 text-gray-800 overflow-auto p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-[500px] relative max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="sticky top-0 float-right text-xl font-bold bg-white"
            >
              ×
            </button>

            {/* Title */}
            <h2 className="text-xl font-bold mb-2">{selectedItem.title}</h2>

            {/* Description */}
            {"synopsis" in selectedItem && selectedItem.synopsis && (
              <p className="text-sm text-[#444] mb-3">{selectedItem.synopsis}</p>
            )}
            {"description" in selectedItem && selectedItem.description && (
              <p className="text-sm text-[#444] mb-3">{selectedItem.description}</p>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2 mb-3">
              {user && (
                <>
                  <button
                    onClick={() => toggleFavourite(selectedItem, getType(mode))}
                    className="px-3 py-1 rounded-lg border"
                  >
                    {isFavourite(selectedItem.id, getType(mode))
                      ? "★ Remove Favourite"
                      : "☆ Add Favourite"}
                  </button>
                  <button
                    onClick={handleLeaveReview}
                    className="px-3 py-1 rounded-lg border text-green-600"
                  >
                    Leave Review
                  </button>
                  <button
                    onClick={() => reportContent(selectedItem, getType(mode))}
                    className="px-3 py-1 rounded-lg border text-red-600"
                  >
                    Report Content
                  </button>
                </>
              )}

              {/* External links */}
              {isBook(selectedItem) && selectedItem.infoLink && (
                <a
                  href={selectedItem.infoLink}
                  target="_blank"
                  rel="noopener"
                  className="text-[#0a58ca] text-sm"
                >
                  View on Google Books
                </a>
              )}
              {isVideo(selectedItem) && (
                <a
                  href={`https://www.youtube.com/watch?v=${selectedItem.id}`}
                  target="_blank"
                  rel="noopener"
                  className="text-[#0a58ca] text-sm"
                >
                  Watch on YouTube
                </a>
              )}
            </div>

            {/* Reviews */}
            <div className="mt-3">
              <h3 className="font-semibold mb-1">Reviews</h3>
              {reviewsMap[selectedItem.id]?.map((r) => (
                <div
                  key={r.id}
                  className="border border-[#eee] p-2 rounded-lg mb-1 text-sm"
                >
                  <strong>{r.userName}</strong>: {r.content}
                  {user && (
                    <button
                      onClick={() => reportReview(r.id)}
                      className="text-xs text-red-500 ml-2"
                    >
                      Report
                    </button>
                  )}
                </div>
              ))}

              {user && (
                <div className="mt-2">
                  <textarea
                    ref={reviewRef}
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="Write a review…"
                    className="w-full border rounded-lg p-2 text-sm"
                  />
                  <button
                    onClick={submitReview}
                    className="mt-1 px-3 py-1 bg-[#111] text-white rounded-lg"
                  >
                    Submit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chatbot */}
      <Chatbot />
    </main>
  );
}
