'use client';

import { useState, useEffect } from "react";

type ContentItem = {
  id: string;
  title: string;
  authors: string[];
  categories: string[];
  synopsis: string;
  thumbnail: string;
  link: string;
  filename: string;
};

export default function TestViewPage() {
  const [category, setCategory] = useState<"books" | "videos">("books");
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setMessage(null);

      try {
        const res = await fetch(`/api/github/list-files?category=${category}`);
        const files: { name: string; path: string }[] = await res.json();

        // Fetch file content for each
        const contentPromises = files.map(async (file) => {
          const r = await fetch(`/api/github/get-file?path=${encodeURIComponent(file.path)}`);
          const data = await r.json();
          return {
            id: data.id || file.name, // fallback to filename if id missing
            title: data.title || "No Title",
            authors: data.authors || [],
            categories: data.categories || [],
            synopsis: data.synopsis || "",
            thumbnail: data.thumbnail || "",
            link: data.link || "#",
            filename: file.name,
          };
        });

        const results = await Promise.all(contentPromises);
        setItems(results);
      } catch (err: any) {
        console.error(err);
        setMessage("❌ Failed to fetch items: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [category]);

  return (
    <section className="bg-white py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-pink-600 mb-6 text-center">
          View {category.charAt(0).toUpperCase() + category.slice(1)}
        </h1>

        {/* Category Toggle */}
        <div className="flex justify-center gap-4 mb-6">
          {["books", "videos"].map((type) => (
            <button
              key={type}
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

        {loading ? (
          <p className="text-center text-gray-700">Loading {category}...</p>
        ) : items.length === 0 ? (
          <p className="text-center text-gray-700">No {category} found.</p>
        ) : (
          <ul className="space-y-6">
            {items.map((item) => (
              <li key={item.id} className="border rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
                {item.thumbnail && (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full md:w-40 h-40 object-cover rounded-md"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-pink-600 mb-2">{item.title}</h2>
                  <p className="text-gray-800 mb-1">
                    <span className="font-semibold">Authors:</span> {item.authors.join(", ")}
                  </p>
                  <p className="text-gray-800 mb-1">
                    <span className="font-semibold">Categories:</span> {item.categories.join(", ")}
                  </p>
                  <p className="text-gray-700 mb-2">{item.synopsis}</p>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      className="text-pink-600 hover:underline font-semibold"
                    >
                      View Link
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {message && (
          <p className="mt-6 text-center text-red-500 font-medium">{message}</p>
        )}
      </div>
    </section>
  );
}
