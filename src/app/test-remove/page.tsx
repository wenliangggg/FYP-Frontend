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
  const [confirmFile, setConfirmFile] = useState<FileItem | null>(null);

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
      setConfirmFile(null);
    }
  };

  return (
    <section className="bg-white py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-pink-600 mb-6 text-center">
          GitHub Content Manager
        </h1>

        {/* Toggle between Books / Videos */}
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

        {/* File list */}
        {loading ? (
          <p>Loading {category}...</p>
        ) : (
          <ul className="space-y-3">
            {files.map((file) => (
              <li
                key={file.sha}
                className="flex justify-between items-center border border-gray-200 p-3 rounded-md shadow-sm"
              >
                <span className="text-gray-800">{file.name}</span>
                <button
                  onClick={() => setConfirmFile(file)}
                  className="px-3 py-1 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Remove
                </button>
              </li>
            ))}
            {files.length === 0 && (
              <p className="text-gray-600 text-center">
                No {category} found.
              </p>
            )}
          </ul>
        )}

        {/* Confirmation Modal */}
        {confirmFile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
              <h2 className="text-xl font-bold text-pink-600 mb-4">
                Confirm Remove
              </h2>
              <p className="text-gray-700 mb-6">
                Are you sure you want to remove{" "}
                <span className="font-semibold">{confirmFile.name}</span>?  
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleRemove(confirmFile)}
                  className="w-full py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Yes, Remove
                </button>
                <button
                  onClick={() => setConfirmFile(null)}
                  className="w-full py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <p
            className={`mt-6 text-center font-medium ${
              message.startsWith("✅") ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </section>
  );
}
