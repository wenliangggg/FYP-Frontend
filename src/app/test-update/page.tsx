'use client';

import { useState, useEffect } from "react";

export default function GitHubManager() {
  const [category, setCategory] = useState<"books" | "videos">("books");
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch files for the selected category
  useEffect(() => {
    fetch(`/api/github/list-files?category=${category}`)
      .then((res) => res.json())
      .then(setFiles)
      .catch(console.error);
    setSelectedFile(null);
    setFormData(null);
  }, [category]);

  // Fetch file content when selected
  useEffect(() => {
    if (!selectedFile) return;
    fetch(`/api/github/get-file?path=${encodeURIComponent(selectedFile.path)}`)
      .then((res) => res.json())
      .then((data) => setFormData(data))
      .catch(console.error);
  }, [selectedFile]);

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]:
        field === "authors" || field === "categories"
          ? value.split(",").map((v) => v.trim())
          : value,
    }));
  };

  const handleUpdate = async () => {
    if (!selectedFile || !formData) return alert("Select a file first");

    setShowConfirm(false);
    setMessage(null);

    try {
      const res = await fetch("/api/github/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          filename: selectedFile.name,
          content: formData,
          sha: selectedFile.sha,
        }),
      });

      const data = await res.json();
      if (res.ok) setMessage("✅ Update successful!");
      else setMessage("❌ Update failed: " + data.error);
    } catch (err: any) {
      setMessage("❌ Error: " + err.message);
    }
  };

  const handleRemove = async () => {
    if (!selectedFile) return alert("Select a file first");

    setMessage(null);
    try {
      const res = await fetch("/api/github/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          filename: selectedFile.name,
          sha: selectedFile.sha,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Remove successful!");
        setFiles(files.filter((f) => f.name !== selectedFile.name));
        setSelectedFile(null);
        setFormData(null);
      } else setMessage("❌ Remove failed: " + data.error);
    } catch (err: any) {
      setMessage("❌ Error: " + err.message);
    }
  };

  return (
    <section className="bg-white py-16 px-6">
      <div className="max-w-3xl mx-auto">
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

        {/* File List */}
        <ul className="space-y-2 mb-6">
          {files.map((file) => (
            <li
              key={file.sha}
              onClick={() =>
                setSelectedFile(
                  selectedFile?.name === file.name ? null : file
                )
              }
              className={`cursor-pointer p-3 rounded-md border transition ${
                selectedFile?.name === file.name
                  ? "bg-pink-100 border-pink-400 text-gray-900" 
                  : "bg-white border-gray-300 hover:bg-gray-100 text-gray-900"
              }`}
            >
              {file.name}
            </li>
          ))}
          {files.length === 0 && (
            <p className="text-center text-gray-800">
              No {category} found.
            </p>
          )}
        </ul>

        {/* Form Fields */}
        {formData && selectedFile && (
          <form className="bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-4">
            <input
              type="text"
              value={formData.title || ""}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              placeholder="Title"
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-pink-400 focus:border-pink-400"
            />
            <input
              type="text"
              value={formData.authors?.join(", ") || ""}
              onChange={(e) => handleFieldChange("authors", e.target.value)}
              placeholder="Authors (comma separated)"
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-pink-400 focus:border-pink-400"
            />
            <input
              type="text"
              value={formData.categories?.join(", ") || ""}
              onChange={(e) => handleFieldChange("categories", e.target.value)}
              placeholder="Categories (comma separated)"
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-pink-400 focus:border-pink-400"
            />
            <textarea
              value={formData.synopsis || ""}
              onChange={(e) => handleFieldChange("synopsis", e.target.value)}
              placeholder="Synopsis"
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-pink-400 focus:border-pink-400"
            />
            <input
              type="text"
              value={formData.thumbnail || ""}
              onChange={(e) => handleFieldChange("thumbnail", e.target.value)}
              placeholder="Thumbnail URL"
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-pink-400 focus:border-pink-400"
            />

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                className="w-full py-2 bg-pink-600 text-white rounded-md font-semibold hover:bg-pink-700"
              >
                Update
              </button>
            </div>
          </form>
        )}

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
              <h2 className="text-xl font-bold text-pink-600 mb-4">
                Confirm Update
              </h2>
              <p className="text-gray-700 mb-6">
                Are you sure you want to save changes to{" "}
                <span className="font-semibold">{selectedFile?.name}</span>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleUpdate}
                  className="w-full py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
                >
                  Yes, Save
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
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
            className={`mt-4 text-center font-medium ${
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
