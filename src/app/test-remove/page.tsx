'use client';

import { useState, useEffect } from "react";

type FileItem = {
  name: string;
  path: string;
  sha: string;
};

export default function TestRemovePage() {
  const [category, setCategory] = useState<"books" | "videos">("books");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // fetch files whenever category changes
  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      setMessage(null);

      try {
        const res = await fetch(`/api/github/list-files?category=${category}`);
        const data = await res.json();
        if (res.ok) {
          setFiles(data);
        } else {
          setMessage("❌ Failed to fetch files: " + data.error);
        }
      } catch (err: any) {
        setMessage("❌ Error: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [category]);

  const handleRemove = async (file: FileItem) => {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/github/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          filename: file.name,
          sha: file.sha,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Removed ${file.name}`);
        setFiles(files.filter((f) => f.name !== file.name));
      } else {
        setMessage("❌ Remove failed: " + data.error);
      }
    } catch (err: any) {
      setMessage("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">GitHub Content Manager</h1>

      {/* Toggle category */}
      <div className="flex gap-2">
        <button
          onClick={() => setCategory("books")}
          className={`px-4 py-2 rounded ${
            category === "books" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Books
        </button>
        <button
          onClick={() => setCategory("videos")}
          className={`px-4 py-2 rounded ${
            category === "videos" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Videos
        </button>
      </div>

      {/* File list */}
      {loading ? (
        <p>Loading {category}...</p>
      ) : (
        <ul className="space-y-2">
          {files.map((file) => (
            <li
              key={file.sha}
              className="flex justify-between items-center border p-2 rounded"
            >
              <span>{file.name}</span>
              <button
                onClick={() => handleRemove(file)}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                disabled={loading}
              >
                Remove
              </button>
            </li>
          ))}
          {files.length === 0 && <p>No {category} found.</p>}
        </ul>
      )}

      {message && <p>{message}</p>}
    </div>
  );
}
