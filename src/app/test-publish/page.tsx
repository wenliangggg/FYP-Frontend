'use client';

import { useState } from "react";

// Example Discovery Page categories
const DISCOVERY_CATEGORIES = [
  "Juvenile Fiction",
  "Early Readers",
  "Educational",
  "Art",
  "Entertainment"
];

export default function TestPublishPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Form state
  const [category, setCategory] = useState<"books" | "videos">("books");
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [synopsis, setSynopsis] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [link, setLink] = useState(""); // New field for book/video link

  const generateId = () => title;

  const handleCategoryToggle = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handlePublish = async () => {
    setLoading(true);
    setMessage(null);

    const id = generateId();
    const filename = `${id}.json`;

    const newItem = {
      id,
      title,
      authors: authors.split(",").map(a => a.trim()),
      categories: selectedCategories,
      synopsis,
      thumbnail,
      link, // include link in the JSON
    };

    try {
      const res = await fetch("/api/github/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category, // books or videos
          filename,
          content: newItem,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Publish successful! File: ${filename} (${category})`);
        // reset form
        setTitle("");
        setAuthors("");
        setSelectedCategories([]);
        setSynopsis("");
        setThumbnail("");
        setLink("");
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
          Publish Content to GitHub
        </h1>

        {/* Category Selector */}
        <div className="flex justify-center gap-4 mb-6">
          {["books", "videos"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setCategory(type as "books" | "videos")}
              className={`px-4 py-2 rounded-md font-semibold transition ${
                category === type
                  ? "bg-pink-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

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

          {/* Categories Checkboxes */}
          <div className="mb-4">
            <p className="font-semibold text-gray-800 mb-2">Categories:</p>
            <div className="flex flex-wrap gap-2">
              {DISCOVERY_CATEGORIES.map(cat => (
                <label
                  key={cat}
                  className={`px-3 py-1 border rounded-md cursor-pointer transition ${
                    selectedCategories.includes(cat)
                      ? "bg-pink-600 text-white border-pink-600"
                      : "bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => handleCategoryToggle(cat)}
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

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
          <input
            type="url"
            placeholder="Book / Video Link"
            value={link}
            onChange={e => setLink(e.target.value)}
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
            {loading ? `Publishing ${category}...` : `Publish ${category.charAt(0).toUpperCase() + category.slice(1)}`}
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
