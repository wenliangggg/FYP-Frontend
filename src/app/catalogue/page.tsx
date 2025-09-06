"use client";

import Chatbot from "../components/Chatbot";
import { useEffect, useState } from "react";
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

interface Book {
  id: string;
  title: string;
  authors: string[];
  infoLink: string;
  thumbnail: string;
}

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channel?: string;
  url?: string;
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  content: string;
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
  const [queryText, setQueryText] = useState("");
  const [bucket, setBucket] = useState("");
  const [page, setPage] = useState(1);
  const [books, setBooks] = useState<Book[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [favourites, setFavourites] = useState<any[]>([]);

  const [reviewItem, setReviewItem] = useState<any>(null);
  const [reviewContent, setReviewContent] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewsMap, setReviewsMap] = useState<Record<string, Review[]>>({});

  const pageSize = 20;

  // Convert mode → Firestore type
  const getType = (m: "books" | "videos"): "book" | "video" =>
    m === "books" ? "book" : "video";

  // Listen for auth changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) loadFavourites(u.uid);
      else setFavourites([]);
    });
    return () => unsub();
  }, []);

  // Load favourites
  async function loadFavourites(uid: string) {
    if (!uid) return;
    const snap = await getDocs(collection(db, "users", uid, "favourites"));
    const favs: any[] = [];
    snap.forEach((doc) => favs.push(doc.data()));
    setFavourites(favs);
  }

  // Toggle favourite
  async function toggleFavourite(item: any, type: "book" | "video") {
    if (!user) return alert("Please log in to favourite items.");
    const exists = favourites.find((f) => f.id === item.id && f.type === type);
    const ref = doc(db, "users", user.uid, "favourites", item.id);

    if (exists) {
      await deleteDoc(ref);
      setFavourites(favourites.filter((f) => !(f.id === item.id && f.type === type)));
    } else {
      const newFav: any = { id: item.id, type, title: item.title || "" };
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

  // Submit review
  async function submitReview() {
    if (!user || !reviewItem) return;
    await addDoc(collection(db, "books-video-reviews"), {
      userId: user.uid,
      userName: user.displayName || "Anonymous",
      itemId: reviewItem.id,
      type: reviewItem.type,
      title: reviewItem.title,
      content: reviewContent,
      createdAt: Timestamp.now(),
    });
    setShowReviewModal(false);
    setReviewContent("");
    await loadReviewsForItem(reviewItem.id);
  }

  // Load reviews
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

  // Report review
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

  // Report content (NEW)
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

  // Get initials from title
function getInitials(title: string) {
  if (!title) return "?";
  const words = title.trim().split(" ");
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

// Pick a consistent background color
const colors = ["#F59E0B", "#10B981", "#3B82F6", "#EC4899", "#8B5CF6", "#EF4444"];
function getColor(key: string) {
  // simple hash → same book always gets same color
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}


  // Search / fetch
  useEffect(() => {
    search();
  }, [mode, page, bucket]);

  async function search() {
    setLoading(true);
    try {
      if (mode === "books") {
        const params = new URLSearchParams({
          q: queryText,
          shelf: bucket,
          lang: "en",
          page: String(page),
          pageSize: String(pageSize),
        });
        const res = await fetch(`/catalogue/books?${params.toString()}`);
        const data = await res.json();
        setBooks(data.items || []);
        data.items?.forEach((b: any) => loadReviewsForItem(b.id));
      } else {
        const params = new URLSearchParams({
          q: queryText || "stories for kids",
          page: String(page),
          pageSize: String(pageSize),
        });
        const res = await fetch(`/catalogue/videos?${params.toString()}`);
        const data = await res.json();
        setVideos(data.items || []);
        data.items?.forEach((v: any) => loadReviewsForItem(v.id));
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

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

        {/* Shelves (books only) */}
        {mode === "books" && (
          <div className="flex flex-wrap gap-2 mb-4">
            {shelves.map((s) => (
              <span
                key={s.key}
                onClick={() => {
                  setBucket(s.key);
                  setPage(1);
                }}
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
            ) : (mode === "books" ? books : videos).map((item: any) => (
              <div key={item.id} className="border border-[#eee] rounded-xl p-3 flex flex-col gap-2">
                {item.thumbnail ? (
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
                  {mode === "books" && (
                    <div className="text-sm text-[#666]">
                      {item.authors?.join(", ") || "Unknown author"}
                    </div>
                  )}
                  {mode === "videos" && (
                    <div className="text-sm text-[#666]">{item.channel || ""}</div>
                  )}
                </div>

                {/* External Links */}
                {item.infoLink && (
                  <a
                    href={item.infoLink}
                    target="_blank"
                    rel="noopener"
                    className="text-[#0a58ca] text-sm"
                  >
                    View on Google Books
                  </a>
                )}
                {item.id && mode === "videos" && (
                  <a
                    href={`https://www.youtube.com/watch?v=${item.id}`}
                    target="_blank"
                    rel="noopener"
                    className="text-[#0a58ca] text-sm"
                  >
                    Watch on YouTube
                  </a>
                )}

                {/* Favourites / Reviews / Reports */}
                {user && (
                  <>
                    <button
                      onClick={() => toggleFavourite(item, getType(mode))}
                      className="px-2 py-1 mt-2 text-sm rounded-lg border"
                    >
                      {isFavourite(item.id, getType(mode))
                        ? "★ Remove Favourite"
                        : "☆ Add Favourite"}
                    </button>

                    <button
                      onClick={() => {
                        setReviewItem({ ...item, type: getType(mode) });
                        setShowReviewModal(true);
                      }}
                      className="px-2 py-1 mt-2 text-sm rounded-lg border text-green-600"
                    >
                      Leave Review
                    </button>

                    <button
                      onClick={() => reportContent(item, getType(mode))}
                      className="px-2 py-1 mt-2 text-sm rounded-lg border text-red-600"
                    >
                      Report Content
                    </button>
                  </>
                )}

                {/* Latest Reviews */}
                <div className="mt-2">
                  {reviewsMap[item.id]?.map((r) => (
                    <div key={r.id} className="border-t border-gray-200 pt-2 mt-2">
                      <p className="text-sm">
                        <strong>{r.userName}</strong>: {r.content}
                      </p>
                      {user && (
                        <button
                          onClick={() => reportReview(r.id)}
                          className="text-xs text-red-600 underline mt-1"
                        >
                          Report Review
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
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

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 text-gray-800">
          <div className="bg-white p-6 rounded-xl w-[400px] max-w-full">
            <h2 className="text-xl font-bold mb-3">Leave a Review</h2>
            <textarea
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              rows={5}
              className="w-full border p-2 rounded-lg mb-3"
              placeholder="Write your review here..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-3 py-1 rounded-lg border"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                className="px-3 py-1 rounded-lg bg-green-600 text-white"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chatbot */}
      <Chatbot />
    </main>
  );
}
