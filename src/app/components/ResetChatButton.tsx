"use client";

export default function ResetChatButton() {
  return (
    <button
      onClick={() => (window as any).resetKidflixChat?.()}
      className="fixed bottom-16 right-24 rounded bg-pink-600 px-3 py-2 text-white shadow"
    >
      Reset Chat
    </button>
  );
}
