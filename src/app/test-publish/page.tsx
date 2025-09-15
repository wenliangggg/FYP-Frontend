'use client';

import { useState } from "react";

export default function TestPublishPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Utility to generate a unique ID
  const generateId = () => 'test-' + Date.now();

  const handlePublish = async () => {
    setLoading(true);
    setMessage(null);

    // Generate unique ID & filename
    const id = generateId();
    const filename = `${id}.json`;

    // Example book data
    const newBook = {
      id,
      title: `Test Book ${id}`,
      authors: ["John Doe"],
      categories: ["juvenile_fiction"],
      synopsis: "This is a test book for API testing",
      thumbnail: "",
    };

    try {
      const res = await fetch("/api/github/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "books",   // folder in /content
          filename,            // unique file
          content: newBook,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Publish successful! File: ${filename}`);
        console.log("GitHub response:", data);
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
    <div className="max-w-xl mx-auto mt-10 p-4">
      <h1 className="text-xl font-bold mb-4">Test GitHub Publish API</h1>
      <button
        onClick={handlePublish}
        disabled={loading}
        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? "Publishing..." : "Publish Random Test Book"}
      </button>

      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
