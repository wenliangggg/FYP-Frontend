'use client';

import { useState, useEffect } from "react";

export default function DynamicGitHubManager() {
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);

  // Fetch files
  useEffect(() => {
    fetch("/api/github/list-files")
      .then((res) => res.json())
      .then(setFiles)
      .catch(console.error);
  }, []);

  // Fetch file content when selected
  useEffect(() => {
    if (!selectedFile) return;
    fetch(`/api/github/get-file?path=${encodeURIComponent(selectedFile.path)}`)
      .then((res) => res.json())
      .then((data) => setFileContent(JSON.stringify(data, null, 2)))
      .catch(console.error);
  }, [selectedFile]);

  const handleUpdate = async () => {
    if (!selectedFile) return alert("Select a file first");

    setMessage(null);
    try {
      const res = await fetch("/api/github/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "books",
          filename: selectedFile.name,
          content: JSON.parse(fileContent), // ✅ updated content
          sha: selectedFile.sha, // ✅ include SHA
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
          category: "books",
          filename: selectedFile.name,
          sha: selectedFile.sha,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Remove successful!");
        setFiles(files.filter((f) => f.name !== selectedFile.name));
        setSelectedFile(null);
        setFileContent("");
      } else setMessage("❌ Remove failed: " + data.error);
    } catch (err: any) {
      setMessage("❌ Error: " + err.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">GitHub Content Manager</h1>

      <select
        value={selectedFile?.name || ""}
        onChange={(e) =>
          setSelectedFile(files.find((f) => f.name === e.target.value))
        }
        className="border px-2 py-1 mb-4"
      >
        <option value="">-- Select a file --</option>
        {files.map((f) => (
          <option key={f.name} value={f.name}>
            {f.name}
          </option>
        ))}
      </select>

      {selectedFile && (
        <>
          <textarea
            className="w-full h-64 border p-2 mb-4 font-mono text-sm"
            value={fileContent}
            onChange={(e) => setFileContent(e.target.value)}
          />

          <div className="flex gap-2 mb-4">
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Update
            </button>
            <button
              onClick={handleRemove}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              Remove
            </button>
          </div>
        </>
      )}

      {message && <p>{message}</p>}
    </div>
  );
}
