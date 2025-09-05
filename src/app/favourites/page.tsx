"use client";

import { useEffect, useState } from "react";

export default function FavouritesPage() {
  const [favourites, setFavourites] = useState<any[]>([]);

  useEffect(() => {
    const favs = localStorage.getItem("favourites");
    if (favs) setFavourites(JSON.parse(favs));
  }, []);

  return (
    <main className="bg-white">
      <div className="max-w-[1100px] mx-auto p-6 font-sans text-[#111]">
        <h1 className="mb-3 text-2xl font-bold">My Favourites</h1>

        {favourites.length === 0 ? (
          <p>You haven’t added any favourites yet.</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
            {favourites.map((item) => (
              <div
                key={item.id}
                className="border border-[#eee] rounded-xl p-3 flex flex-col gap-2"
              >
                {item.thumbnail && (
                  <img
                    src={item.thumbnail}
                    alt=""
                    className="w-full h-[165px] object-cover rounded-lg bg-[#fafafa]"
                  />
                )}
                <div>
                  <strong>{item.title}</strong>
                  {item.authors && (
                    <div className="text-sm text-[#666]">
                      {item.authors.join(", ")}
                    </div>
                  )}
                </div>

                {item.type === "book" && item.infoLink && (
                  <a
                    href={item.infoLink}
                    target="_blank"
                    rel="noopener"
                    className="text-[#0a58ca] text-sm"
                  >
                    View on Google Books
                  </a>
                )}
                {item.type === "video" && (
                  <a
                    href={`https://www.youtube.com/watch?v=${item.id}`}
                    target="_blank"
                    rel="noopener"
                    className="text-[#0a58ca] text-sm"
                  >
                    Watch on YouTube
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
