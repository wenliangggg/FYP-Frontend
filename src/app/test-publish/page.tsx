'use client';

import { useState } from "react";

export default function TestPublishPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [categories, setCategories] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [thumbnail, setThumbnail] = useState("");

  const generateId = () => 'test-' + Date.now();

  const handlePublish = async () => {
    setLoading(true);
    setMessage(null);

    const id = generateId();
    const filename = `${id}.json`;

    const newBook = {
      id,
      title,
      authors: authors.split(",").map(a => a.trim()),
      categories: categories.split(",").map(c => c.trim()),
      synopsis,
      thumbnail,
    };

    try {
      const res = await fetch("/api/github/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "books",
          filename,
          content: newBook,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Publish successful! File: ${filename}`);
        console.log("GitHub response:", data);
        // reset form
        setTitle("");
        setAuthors("");
        setCategories("");
        setSynopsis("");
        setThumbnail("");
      } else {
        setMessage("❌ Publish failed: " + (data.error || JSON.stringify(data)));
      }
    } catch (err: any) {
      setMessage("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white py-16 px-6">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-pink-600 mb-6 text-center">
          Publish Book to GitHub
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handlePublish();
          }}
          className="bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-4"
        >
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-pink-400 focus:border-pink-400"
            required
          />
          <input
            type="text"
            placeholder="Authors (comma separated)"
            value={authors}
            onChange={e => setAuthors(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-pink-400 focus:border-pink-400"
            required
          />
          <input
            type="text"
            placeholder="Categories (comma separated)"
            value={categories}
            onChange={e => setCategories(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-pink-400 focus:border-pink-400"
            required
          />
          <textarea
            placeholder="Synopsis"
            value={synopsis}
            onChange={e => setSynopsis(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-pink-400 focus:border-pink-400"
          />
          <input
            type="text"
            placeholder="Thumbnail URL"
            value={thumbnail}
            onChange={e => setThumbnail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-pink-400 focus:border-pink-400"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-md font-semibold transition ${
              loading
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-pink-600 text-white hover:bg-pink-700"
            }`}
          >
            {loading ? "Publishing..." : "Publish Book"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center font-medium ${
              message.startsWith("✅")
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </section>
  );
}
